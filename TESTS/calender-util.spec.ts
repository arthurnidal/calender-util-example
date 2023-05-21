import { updateCalender, InstantBookStatus } from '../index';
import { getUTCDate } from '../utils';

let userAvailability: any[] = [];

describe('Update', () => {
  test('correctly insert into an empty array', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 12, minutes: 0 }),
        available: true,
        instantBook: undefined,
      },
    ];

    expect(updateCalender(userAvailability, expected)).toMatchObject(expected);

    userAvailability = expected;
  });

  test('correctly skip invalid intervals', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: true,
        instantBook: undefined,
      },
    ];

    expect(
      updateCalender(
        [
          {
            from: getUTCDate({ hours: 8, minutes: 0 }),
            to: getUTCDate({ hours: 17, minutes: 0 }),
            available: true,
          },
        ],
        [
          // 0 second interval
          {
            from: getUTCDate({ hours: 11, minutes: 0 }),
            to: getUTCDate({ hours: 11, minutes: 0 }),
            available: false,
            instantBook: undefined,
          },
          // interval that ends in the past
          {
            from: getUTCDate({ hours: 11, minutes: 0 }),
            to: getUTCDate({ hours: 10, minutes: 0 }),
            available: false,
            instantBook: undefined,
          },
        ]
      )
    ).toMatchObject(expected);
  });

  test('correctly insert single newOptOut outside of range', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 12, minutes: 0 }),
        available: true,
        instantBook: undefined,
      },
      {
        from: getUTCDate({ hours: 15, minutes: 0 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: true,
        instantBook: InstantBookStatus.Inactive,
      },
    ];

    expect(
      updateCalender(userAvailability, [
        {
          from: getUTCDate({ hours: 15, minutes: 0 }),
          to: getUTCDate({ hours: 17, minutes: 0 }),
          available: true,
          instantBook: InstantBookStatus.Inactive,
        },
      ])
      // @ts-ignore
    ).toMatchObject(expected);

    userAvailability = expected;
  });

  test('merges optOuts if inserting range with same availability', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 15, minutes: 0 }),
        available: true,
      },
      {
        from: getUTCDate({ hours: 15, minutes: 0 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: true,
        instantBook: InstantBookStatus.Inactive,
      },
    ];

    expect(
      updateCalender(userAvailability, [
        {
          from: getUTCDate({ hours: 11, minutes: 0 }),
          to: getUTCDate({ hours: 15, minutes: 0 }),
          available: true,
        },
      ])
      // @ts-ignore
    ).toMatchObject(expected);

    userAvailability = expected;
  });

  test('split optOuts if inserting range with different availability', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 11, minutes: 30 }),
        available: true,
        instantBook: undefined,
      },
      {
        from: getUTCDate({ hours: 11, minutes: 30 }),
        to: getUTCDate({ hours: 14, minutes: 0 }),
        available: true,
        instantBook: InstantBookStatus.Active,
      },
      {
        from: getUTCDate({ hours: 14, minutes: 0 }),
        to: getUTCDate({ hours: 15, minutes: 0 }),
        available: true,
        instantBook: undefined,
      },
      {
        from: getUTCDate({ hours: 15, minutes: 0 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: true,
        instantBook: InstantBookStatus.Inactive,
      },
    ];

    expect(
      updateCalender(userAvailability, [
        {
          from: getUTCDate({ hours: 11, minutes: 30 }),
          to: getUTCDate({ hours: 14, minutes: 0 }),
          available: true,
          instantBook: InstantBookStatus.Active,
        },
      ])
      // @ts-ignore
    ).toMatchObject(expected);

    userAvailability = expected;
  });

  test('insert multiple items at once and skip blocks which starts and ends at the same time', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 11, minutes: 30 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 11, minutes: 30 }),
        to: getUTCDate({ hours: 12, minutes: 30 }),
        available: true,
        instantBook: InstantBookStatus.Active,
      },
      {
        from: getUTCDate({ hours: 12, minutes: 30 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
    ];

    expect(
      updateCalender(userAvailability, [
        {
          from: getUTCDate({ hours: 8, minutes: 0 }),
          to: getUTCDate({ hours: 11, minutes: 30 }),
          available: false,
          instantBook: InstantBookStatus.Undefined,
        },
        {
          from: getUTCDate({ hours: 12, minutes: 30 }),
          to: getUTCDate({ hours: 17, minutes: 0 }),
          available: false,
          instantBook: InstantBookStatus.Undefined,
        },
      ])
      // @ts-ignore
    ).toMatchObject(expected);

    userAvailability = expected;
  });

  test('insert correctly instantBook available true', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 12, minutes: 30 }),
        available: true,
        instantBook: InstantBookStatus.Active,
      },
      {
        from: getUTCDate({ hours: 12, minutes: 30 }),
        to: getUTCDate({ hours: 14, minutes: 0 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 14, minutes: 0 }),
        to: getUTCDate({ hours: 15, minutes: 30 }),
        available: true,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 15, minutes: 30 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
    ];

    expect(
      updateCalender(userAvailability, [
        {
          from: getUTCDate({ hours: 8, minutes: 0 }),
          to: getUTCDate({ hours: 11, minutes: 30 }),
          available: true,
          instantBook: InstantBookStatus.Active,
        },
        {
          from: getUTCDate({ hours: 14, minutes: 0 }),
          to: getUTCDate({ hours: 15, minutes: 30 }),
          available: true,
          instantBook: undefined,
        },
      ])
      // @ts-ignore
    ).toMatchObject(expected);

    userAvailability = expected;
  });

  test('prepend new optOut at the start of the availability', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 6, minutes: 0 }),
        to: getUTCDate({ hours: 7, minutes: 0 }),
        available: true,
        instantBook: InstantBookStatus.Active,
      },
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 12, minutes: 30 }),
        available: true,
        instantBook: InstantBookStatus.Active,
      },
      {
        from: getUTCDate({ hours: 12, minutes: 30 }),
        to: getUTCDate({ hours: 14, minutes: 0 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 14, minutes: 0 }),
        to: getUTCDate({ hours: 15, minutes: 30 }),
        available: true,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 15, minutes: 30 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
    ];

    expect(
      updateCalender(userAvailability, [
        {
          from: getUTCDate({ hours: 6, minutes: 0 }),
          to: getUTCDate({ hours: 7, minutes: 0 }),
          available: true,
          instantBook: InstantBookStatus.Active,
        },
      ])
      // @ts-ignore
    ).toMatchObject(expected);

    userAvailability = expected;
  });

  test('append new optOut at the end of the availability', () => {
    const expected = [
      {
        from: getUTCDate({ hours: 6, minutes: 0 }),
        to: getUTCDate({ hours: 7, minutes: 0 }),
        available: true,
        instantBook: InstantBookStatus.Active,
      },
      {
        from: getUTCDate({ hours: 8, minutes: 0 }),
        to: getUTCDate({ hours: 12, minutes: 30 }),
        available: true,
        instantBook: InstantBookStatus.Active,
      },
      {
        from: getUTCDate({ hours: 12, minutes: 30 }),
        to: getUTCDate({ hours: 14, minutes: 0 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 14, minutes: 0 }),
        to: getUTCDate({ hours: 15, minutes: 30 }),
        available: true,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 15, minutes: 30 }),
        to: getUTCDate({ hours: 17, minutes: 0 }),
        available: false,
        instantBook: InstantBookStatus.Undefined,
      },
      {
        from: getUTCDate({ hours: 18, minutes: 0 }),
        to: getUTCDate({ hours: 20, minutes: 30 }),
        available: false,
        instantBook: undefined,
      },
    ];

    expect(
      updateCalender(userAvailability, [
        {
          from: getUTCDate({ hours: 18, minutes: 0 }),
          to: getUTCDate({ hours: 20, minutes: 30 }),
          available: false,
          instantBook: undefined,
        },
      ])
      // @ts-ignore
    ).toMatchObject(expected);

    userAvailability = expected;
  });
});
