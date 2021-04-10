function createParams(threadId, offset, loadAfter, query, count, cache, messageType) {
  const isOffset = offset && (offset + "").length < 19;
  return {
    threadId,
    offset: isOffset ? offset + 1 : null,
    toTimeFull: isOffset ? null : loadAfter ? null : offset,
    fromTimeFull: isOffset ? null : loadAfter ? offset : null,
    order: isOffset ? "DESC" : loadAfter ? "ASC" : "DESC",
    cache,
    query,
    count,
    messageType
  }
}

function _getThreadHistory(chatSDK, threadId, count, offsetOrTimeNanos, loadAfter, query, cache, messageType) {
  return chatSDK.getThreadMessageList(createParams(threadId, offsetOrTimeNanos, loadAfter, query, count, cache, messageType));
}

export function getThreadHistory() {
  return _getThreadHistory.apply(null, arguments);
}

export function getThreadHistoryByQuery(chatSDK, threadId, query, count) {
  return _getThreadHistory(chatSDK, threadId, count, null, null, query, false);
}

export function getThreadHistoryInMiddle(chatSDK, threadId, timeNano, count) {
  return new Promise((resolve, reject) => {
    _getThreadHistory(chatSDK, threadId, count, timeNano + 200, true, null, false).then(afterResult => {
      _getThreadHistory(chatSDK, threadId, count, timeNano, false, null, false).then(beforeResult => {
        resolve({
          threadId,
          messagesCount: afterResult.contentCount + beforeResult.contentCount,
          hasNext: afterResult.hasNext,
          hasPrevious: beforeResult.hasPrevious,
          messages: [...afterResult.messages, ...beforeResult.messages]
        });
      }, reject);
    }, reject);
  })
}

