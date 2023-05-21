import { cloneDeep, get, set } from 'lodash';

/*
Insert your implementation of the calnder below
*/
export interface CalenderBlock {
  from: Date;
  to: Date;
  available: boolean;
  instantBook?: InstantBookStatus;
}

export enum InstantBookStatus {
  Undefined = 0,
  Active = 1,
  Inactive = 2,
}

export function updateCalender(
  existing: CalenderBlock[],
  update: CalenderBlock[]
) {
  if (!existing) {
    existing = [];
  }

  if (!existing.length) {
    return update || [];
  }

  /*
  insert the path to the Date field in your implementation 
  of CalenderBlock that contains the start and end of the Block
  */
  const pathToStartDate = 'from',
    pathToEndDate = 'to';

  const newValues: CalenderBlock[] = cloneDeep(existing);

  const [firstOverlapIndex, lastOverlapIndex] = getUpdateOverlap(
    newValues,
    update,
    pathToStartDate,
    pathToEndDate
  );

  const originalValues = newValues.slice(firstOverlapIndex, lastOverlapIndex);

  const allDates = originalValues
    .concat(update)
    .reduce((acc: Date[], curr: CalenderBlock): Date[] => {
      acc.push(get(curr, pathToStartDate));
      acc.push(get(curr, pathToEndDate));

      return acc;
    }, []);

  const combinedValues = allDates.reduce(
    (
      acc: {
        date: Date;
        originalVal?: CalenderBlock;
        newVal?: CalenderBlock;
      }[],
      curr
    ) => {
      const original = originalValues.find(
        (o) => get(o, pathToStartDate) <= curr && get(o, pathToEndDate) > curr
      );

      const newVal = update.find(
        (o) => get(o, pathToStartDate) <= curr && get(o, pathToEndDate) > curr
      );

      acc.push({
        date: curr,
        originalVal: original,
        newVal: newVal,
      });

      return acc;
    },
    []
  );

  combinedValues.sort((a, b) => a.date.valueOf() - b.date.valueOf());

  let currentBlock: CalenderBlock | undefined = undefined;
  const added: CalenderBlock[] = [];

  for (const combinedValue of combinedValues) {
    const target = getTarget(combinedValue.newVal, combinedValue.originalVal);

    if (!currentBlock) {
      currentBlock = Object.assign({}, target);
      set(currentBlock, pathToStartDate, combinedValue.date);

      continue;
    }

    set(currentBlock, pathToEndDate, combinedValue.date);

    if (!target) {
      added.push(currentBlock);
      currentBlock = undefined;

      continue;
    }

    if (!compareBlocks(currentBlock, target)) {
      added.push(currentBlock);

      currentBlock = Object.assign({}, target);
      set(currentBlock, pathToStartDate, combinedValue.date);
    }
  }

  if (
    currentBlock &&
    get(currentBlock, pathToEndDate) > get(currentBlock, pathToStartDate)
  ) {
    added.push(currentBlock);
  }

  newValues.splice(
    firstOverlapIndex,
    lastOverlapIndex - firstOverlapIndex,
    ...added
  );

  return newValues;
}

function getUpdateOverlap(
  existing: CalenderBlock[],
  update: CalenderBlock[],
  pathToStartDate: string,
  pathToEndDate: string
): [number, number] {
  let min: Date = get(update[0], pathToStartDate);
  let max: Date = get(update[update.length - 1], pathToEndDate);

  let firstOverlapIndex: number = 0;
  let lastOverlapIndex: number = 0;

  for (let i = 0; i < existing.length; i++) {
    const blockStartDate = get(existing[i], pathToStartDate);

    if (blockStartDate < min) {
      firstOverlapIndex = i;
    }

    if (blockStartDate <= max) {
      lastOverlapIndex = i;
    }
  }

  return [firstOverlapIndex, lastOverlapIndex + 1];
}

function compareBlocks(a: CalenderBlock, b: CalenderBlock): boolean {
  return a.available === b.available && a.instantBook === b.instantBook;
}

function mergeBlocks(
  update: CalenderBlock,
  original: CalenderBlock
): CalenderBlock {
  // @ts-ignore
  return {
    available: get(update, 'available', get(original, 'available')),
    instantBook: get(update, 'instantBook', get(original, 'instantBook')),
  };
}

function getDefaultValues(): Partial<CalenderBlock> {
  return { instantBook: undefined };
}

function getTarget(
  newVal?: CalenderBlock,
  original?: CalenderBlock
): CalenderBlock | undefined {
  if (!newVal && !original) {
    return;
  }

  const defaultValues = getDefaultValues();

  const newTarget = Object.assign({}, defaultValues);

  if (newVal && original) {
    return Object.assign(newTarget, mergeBlocks(newVal, original));
  }

  return Object.assign(newTarget, newVal || original);
}
