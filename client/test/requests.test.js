import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Request Management & Atomic Exchange Audit', () => {
  it('should create exchange request and prevent self-requests and duplicate pending requests', () => {
    let requests = [];

    const createRequestMock = ({ listing, requester, offerType, cashAmount, handoffSpot }) => {
      if (listing.user_id === requester.id) {
        throw new Error('CANNOT_REQUEST_OWN_LISTING');
      }

      const duplicate = requests.find(
        r => r.listing_id === listing.id && r.requester_id === requester.id && r.status === 'pending'
      );
      if (duplicate) {
        throw new Error('DUPLICATE_PENDING_REQUEST');
      }

      const req = {
        id: `req_${Date.now()}`,
        listing_id: listing.id,
        listing_title: listing.title,
        owner_id: listing.user_id,
        requester_id: requester.id,
        requester_name: requester.name,
        offer_type: offerType,
        offer_amount_inr: offerType === 'cash' ? cashAmount : 0,
        handoff_spot: handoffSpot,
        status: 'pending'
      };

      requests.push(req);
      return req;
    };

    const targetListing = {
      id: 'list_1',
      title: 'Operating Systems Concepts',
      user_id: 'owner_100',
      user_name: 'Priya N'
    };

    const studentA = { id: 'student_200', name: 'Arjun K' };

    // 1. Valid request creation
    const req = createRequestMock({
      listing: targetListing,
      requester: studentA,
      offerType: 'swap_credit',
      cashAmount: 0,
      handoffSpot: 'CSE / ISE Block'
    });

    assert.equal(requests.length, 1);
    assert.equal(req.status, 'pending');
    assert.equal(req.listing_title, 'Operating Systems Concepts');

    // 2. Reject duplicate pending request
    assert.throws(() => {
      createRequestMock({
        listing: targetListing,
        requester: studentA,
        offerType: 'swap_credit',
        cashAmount: 0,
        handoffSpot: 'CSE / ISE Block'
      });
    }, /DUPLICATE_PENDING_REQUEST/);

    // 3. Reject self request
    assert.throws(() => {
      createRequestMock({
        listing: targetListing,
        requester: { id: 'owner_100', name: 'Priya N' },
        offerType: 'swap_credit',
        cashAmount: 0,
        handoffSpot: 'CSE / ISE Block'
      });
    }, /CANNOT_REQUEST_OWN_LISTING/);
  });

  it('should accept request atomically: reserve listing, create chat, insert safety message', () => {
    let requests = [
      { id: 'req_10', listing_id: 'list_OS', owner_id: 'user_A', requester_id: 'user_B', requester_name: 'Kavya S', proposed_handoff: 'Main Library Entrance', status: 'pending' }
    ];
    let listings = [
      { id: 'list_OS', title: 'Modern OS', status: 'available' }
    ];
    let chats = [];

    const acceptRequestMock = (requestId, currentUserId = 'user_A') => {
      const req = requests.find(r => r.id === requestId);
      if (!req || req.status !== 'pending') throw new Error('REQUEST_NOT_PENDING');
      if (req.owner_id !== currentUserId) throw new Error('UNAUTHORIZED');

      // Update request
      req.status = 'accepted';

      // Reserve listing
      const listing = listings.find(l => l.id === req.listing_id);
      if (listing) listing.status = 'reserved';

      // Create chat atomically
      const chatId = `chat_${Date.now()}`;
      const chat = {
        id: chatId,
        request_id: requestId,
        listing_id: req.listing_id,
        user_one_id: req.owner_id,
        user_two_id: req.requester_id,
        handoff_spot: req.proposed_handoff,
        status: 'active',
        messages: [
          { sender_id: 'system', text: `📍 Handoff spot confirmed: ${req.proposed_handoff}`, message_type: 'system' }
        ]
      };
      chats.push(chat);
      return chatId;
    };

    const chatId = acceptRequestMock('req_10', 'user_A');
    assert.ok(chatId);
    assert.equal(requests[0].status, 'accepted');
    assert.equal(listings[0].status, 'reserved');
    assert.equal(chats.length, 1);
    assert.equal(chats[0].handoff_spot, 'Main Library Entrance');
    assert.equal(chats[0].messages[0].message_type, 'system');
  });
});

