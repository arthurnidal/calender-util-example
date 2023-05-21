import { add } from 'date-fns';

export function getUTCDate(
  values: {
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  } = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  },
  date: Date = new Date(),
  timezoneOffset = 0
) {
  const time = { hours: 0, minutes: 0, seconds: 0, milliseconds: 0, ...values };

  return add(
    new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getUTCDate(),
        time.hours,
        time.minutes,
        time.seconds,
        time.milliseconds
      )
    ),
    { minutes: timezoneOffset }
  );
}
