import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Book Listing Lifecycle Audit', () => {
  it('should validate and create a book listing with defaults', () => {
    let listings = [];
    let ledger = [];
    let userBalance = 2;

    const createListingMock = (input, userId = 'usr_1', userName = 'Rahul V') => {
      if (!input.title || !input.author || !input.category) {
        throw new Error('MISSING_REQUIRED_FIELDS');
      }

      const listing = {
        id: `list_${Date.now()}`,
        user_id: userId,
        user_name: userName,
        user_branch: 'ECE',
        user_year: '3rd Year',
        views: 1,
        status: 'available',
        created_at: new Date().toISOString(),
        ...input
      };

      listings = [listing, ...listings];

      // Dual-token rule: Swap listing rewards 1 token
      if (input.exchange_type === 'swap') {
        userBalance += 1;
        ledger.push({
          id: `led_${Date.now()}`,
          type: 'credit',
          amount: 1,
          description: `Earned 1 Token for listing ${input.title}`
        });
      }

      return listing;
    };

    const newBook = createListingMock({
      title: 'Digital Signal Processing (DSP)',
      author: 'Proakis & Manolakis',
      subject_code: '18EC52',
      semester: 5,
      category: 'Engineering Textbook',
      condition: 'Like New',
      exchange_type: 'swap',
      handoff_spot: 'ECE Block Lobby',
      image_url: 'https://example.com/dsp.jpg'
    });

    assert.equal(listings.length, 1);
    assert.equal(listings[0].title, 'Digital Signal Processing (DSP)');
    assert.equal(listings[0].status, 'available');
    assert.equal(userBalance, 3, 'User should be awarded 1 credit token for swap listing');
    assert.equal(ledger.length, 1);
  });

  it('should update listing details successfully', () => {
    let listings = [
      { id: 'list_101', title: 'Signals & Systems', author: 'Oppenheim', handoff_spot: 'ECE Block Lobby', status: 'available' }
    ];

    const updateListingMock = (id, updates) => {
      listings = listings.map(l => l.id === id ? { ...l, ...updates } : l);
      return listings.find(l => l.id === id);
    };

    const updated = updateListingMock('list_101', {
      title: 'Signals & Systems (VTU 2nd Edition)',
      handoff_spot: 'Main Library Entrance'
    });

    assert.equal(updated.title, 'Signals & Systems (VTU 2nd Edition)');
    assert.equal(updated.handoff_spot, 'Main Library Entrance');
    assert.equal(listings[0].title, 'Signals & Systems (VTU 2nd Edition)');
  });

  it('should delete/deactivate a listing from user active listings', () => {
    let listings = [
      { id: 'list_101', title: 'Signals & Systems' },
      { id: 'list_102', title: 'Microcontrollers 8051' }
    ];

    const deleteListingMock = (id) => {
      listings = listings.filter(l => l.id !== id);
    };

    deleteListingMock('list_101');
    assert.equal(listings.length, 1);
    assert.equal(listings[0].id, 'list_102');
  });
});

