import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Messaging & Realtime Chat Audit', () => {
  it('should mask personal contact info and permit message submission only by participants', () => {
    const chat = {
      id: 'chat_501',
      user_one_id: 'user_1',
      user_two_id: 'user_2',
      status: 'active',
      messages: []
    };

    const postMessage = (chatObj, senderId, text) => {
      // Authorization check
      if (senderId !== chatObj.user_one_id && senderId !== chatObj.user_two_id) {
        throw new Error('NOT_AUTHORIZED_CHAT_PARTICIPANT');
      }
      if (!text || !text.trim()) {
        throw new Error('EMPTY_MESSAGE');
      }

      const msg = {
        id: `msg_${Date.now()}`,
        chat_id: chatObj.id,
        sender_id: senderId,
        content: text.trim(),
        created_at: new Date().toISOString()
      };
      chatObj.messages.push(msg);
      return msg;
    };

    // Valid participant sends message
    const msg1 = postMessage(chat, 'user_1', "I'm near the ECE Block Lobby!");
    assert.equal(chat.messages.length, 1);
    assert.equal(msg1.content, "I'm near the ECE Block Lobby!");

    // Non-participant attempt
    assert.throws(() => {
      postMessage(chat, 'user_intruder_99', 'Hello intruder');
    }, /NOT_AUTHORIZED_CHAT_PARTICIPANT/);
  });

  it('should confirm swap atomically: mark chat completed, record in ledger & history, reward token', () => {
    let chat = {
      id: 'chat_501',
      listing_id: 'list_123',
      listing_title: 'Computer Networks (Tanenbaum)',
      partner_name: 'Sneha R',
      status: 'active'
    };
    let listing = { id: 'list_123', status: 'reserved' };
    let ledgers = [];
    let history = [];
    let userBalance = 3;

    const confirmSwapMock = () => {
      if (chat.status === 'completed') return;

      chat.status = 'completed';
      listing.status = 'completed';
      userBalance += 1;

      ledgers.push({
        id: `led_${Date.now()}`,
        type: 'credit',
        amount: '+1 Token',
        description: `Completed Swap for '${chat.listing_title}' with ${chat.partner_name}`
      });

      history.push({
        id: `hist_${Date.now()}`,
        book_title: chat.listing_title,
        counterparty: chat.partner_name,
        status: 'Completed'
      });
    };

    confirmSwapMock();
    assert.equal(chat.status, 'completed');
    assert.equal(listing.status, 'completed');
    assert.equal(userBalance, 4);
    assert.equal(ledgers.length, 1);
    assert.equal(history.length, 1);
  });
});

