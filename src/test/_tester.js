export function expect(func, parameter, expect) {
  const result = func.apply(null, parameter);
  const expectResult = JSON.stringify(result) === JSON.stringify(expect);
  if (!expectResult) {
    throw {result, _failed: true}
  }
  return result;
}

export function batch(tests, func) {
  let testPassed = true;
  let totalTestNumber = 0;
  let failedTestNumber = 0;
  const failedTests = [];
  const successTests = [];
  for (const test of tests) {
    const {expect: _expect, params, id} = test;
    try {
      const result = expect(func, params, _expect);
      successTests.push({id, expect: _expect, result})
    } catch (e) {
      testPassed = false;
      failedTests.push({id, expect: _expect, result: e.result});
      failedTestNumber++;
    }
    totalTestNumber++;
  }
  const divider = "----------";
  const headerString = testPassed ? `Successful test for ${func.name}` : `Test of ${func.name} failed`;
  const testStatus = `Total test number: ${totalTestNumber}\nFailed test count: ${failedTestNumber}, Successful test count: ${totalTestNumber - failedTestNumber}`;
  const details = `Details:`;
  let failedTestString = "";
  let successFulTestString = "";

  for (const failedTest of failedTests) {
    failedTestString += `\nId: ${failedTest.id}\nExpect to get: ${JSON.stringify(failedTest.expect)}\nBut get: ${JSON.stringify(failedTest.result)}\n${divider}`;
  }
  for (const failedTest of successTests) {
    failedTestString += `\nId: ${failedTest.id}\nSuccessful result: ${JSON.stringify(failedTest.expect)}\n${divider}`;
  }
  return `${headerString}\n${divider}\n${testStatus}\n${divider}\n${details}\n${divider}\n${failedTestString ? `${failedTestString}\n` : ""}\n${successFulTestString ? `${successFulTestString}\n` : ""}`;
}