const timeoutDefault = 3000;

/* X [X -> Promise<Y>] Natural -> Promise<Y>
  Calls the given function on the given subject to produce a Promise.

  Returns a new Promise that will resolve if the produced Promise resolves within
  the timeout, else rejects, including in the case where the function fails
  to provide a Promise.
*/
function protectedPromise(subject, promiseFunction, timeout = timeoutDefault) {
  let timeoutPromise = new Promise((resolve, reject) => {
    return setTimeout(() => {
      console.log('timeout func finally timed out');
      return reject();
    }, timeout);
  });
  try {
    let promise = promiseFunction(subject);
    if (!(promise instanceof Promise)) {
      return Promise.reject();
    }
    return Promise.race([timeoutPromise, promise]);
  } catch (err) {
    // this catches the case where promiseFunction itself throws an error
    return Promise.reject();
  }
}

module.exports = protectedPromise;