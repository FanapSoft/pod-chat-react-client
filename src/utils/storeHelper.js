export function stateGenerator(state, response, payloadKey) {
  let object;
  if (state === "PENDING") {
    object = {fetching: true, fetched: false, error: false};
  } else if (state === "REJECTED" || state === "ERROR") {
    object = {fetching: false, fetched: false, error: response};
  } else if (state === "CANCELED") {
    object = {fetching: false, fetched: false, error: false};
    if (response) {
      object = {...object, ...response};
    }
  } else {
    object = {fetching: false, fetched: true, error: false};
  }
  if (payloadKey) {
    object = {...object, [payloadKey]: response};
  } else {
    object = {...object, ...response}
  }
  return object;
}

/**
 * update store list by specific strategy
 * @param item represent oldList that new to update
 * @param newItem updated list that need to take action on oldList
 * @param strategy of updating
 */
export function updateStore(item, newItem, strategy) {
  const {method, by, upsert, mix, or} = strategy;
  const isItemArray = item instanceof Array;
  const isNewItemArray = newItem instanceof Array;
  const isItemSingleton = !isItemArray && !(item instanceof Object);
  const isNewItemSingleton = !isNewItemArray && !(newItem instanceof Object);
  const itemClone = isItemArray ? [...item] : isItemSingleton ? item : {...item};
  const newItemClone = isNewItemArray ? [...newItem] : isNewItemSingleton ? newItem : {...newItem};

  function findingStrategy(item, newItem) {
    function notValidComparisonStrategy(value, newValue) {
      if (value === undefined || value === null) {
        return true;
      }
      if (newValue === undefined || newValue === null) {
        return true;
      }
    }

    if (isItemSingleton && isNewItemSingleton) {
      return item === newItem;
    }
    if (by instanceof Array) {
      for (const byItem of by) {
        if (isItemSingleton) {
          if (notValidComparisonStrategy(item, newItem[byItem])) {
            continue;
          }
          const result = item === newItem[byItem];
          if (or) {
            if (result) {
              return true;
            }
          } else if (!result) {
            return;
          }
        } else if (isNewItemSingleton) {
          if (notValidComparisonStrategy(item[by], newItem)) {
            continue;
          }
          const result = item[by] === newItem;
          if (or) {
            if (result) {
              return true;
            }
          } else if (!result) {
            return;
          }
        }
        if (notValidComparisonStrategy(item[byItem], newItem[byItem])) {
          continue;
        }
        const result = item[byItem] === newItem[byItem];
        if (or) {
          if (result) {
            return true;
          }
        } else if (!result) {
          return;
        }
      }
      if (!or) {
        return true;
      }
    } else {
      if (isItemSingleton || isNewItemSingleton) {
        return isItemSingleton ? item === newItem[by] : item[by] === newItem;
      }
      if (method === listUpdateStrategyMethods.REMOVE) {
        const isNewItemIsSingleton = !(newItem instanceof Array) && !(newItem instanceof Object);
        if (isNewItemIsSingleton) {
          return item[by] === newItem;
        }
      }
      return item[by] === newItem[by];
    }
  }

  function decision(result, updateResult) {
    if (isItemSingleton && isNewItemSingleton) {
      if (result) {
        return newItemClone;
      }
      return itemClone
    }
    if (isItemArray && isNewItemArray) {
      if (result > -1) {
        if (method === listUpdateStrategyMethods.UPDATE) {
          if (mix) {
            itemClone[result] = {...itemClone[result], ...newItemClone[updateResult]}
          } else {
            itemClone[result] = newItemClone[updateResult];
          }
        } else if (method === listUpdateStrategyMethods.REMOVE) {
          itemClone.splice(result, 1);
        }
      } else {
        if (upsert) {
          itemClone.push(newItemClone[updateResult]);
        }
      }
      return itemClone;
    }
    if (isItemArray) {
      if (result > -1) {
        if (method === listUpdateStrategyMethods.UPDATE) {
          if (mix) {
            itemClone[result] = {...itemClone[result], ...newItemClone};
          } else {
            itemClone[result] = newItemClone;
          }
        } else {
          itemClone.splice(result, 1);
        }
      } else {
        if (upsert) {
          itemClone.push(newItemClone);
        }
      }
      return itemClone;
    }
    if (result) {
      if (method === listUpdateStrategyMethods.REMOVE) {
        return null;
      }
      if (mix) {
        return {...itemClone, ...newItemClone}
      }
      return newItemClone;
    }
    return itemClone;
  }

  if (isNewItemArray) {
    let index = 0;
    for (const newIt of newItemClone) {
      if (isItemArray) {
        decision(itemClone.findIndex(it => findingStrategy(it, newIt)), index);
      } else {
        let result;
        if (method === listUpdateStrategyMethods.UPDATE) {
          if (result = decision(findingStrategy(itemClone, newIt))) {
            return result;
          }
        } else {
          if (!(result = decision(findingStrategy(itemClone, newIt)))) {
            return null;
          }
        }
      }
      index++;
    }
    return itemClone;
  } else {
    if (isItemArray) {
      decision(itemClone.findIndex(it => findingStrategy(it, newItemClone)));
      return itemClone;
    } else {
      return decision(findingStrategy(itemClone, newItemClone));
    }
  }
}

export const listUpdateStrategyMethods = {
  REMOVE: "REMOVE",
  UPDATE: "UPDATE"
};

export const stateGeneratorState = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  CANCELED: "CANCELED"
};
