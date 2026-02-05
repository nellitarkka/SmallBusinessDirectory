const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const runMiddlewares = async (middlewares, req, res) => {
  for (const middleware of middlewares) {
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const result = middleware(req, res, next);
    if (result && typeof result.then === 'function') {
      await result;
    }

    if (nextCalled) {
      continue;
    }

    if (res.status.mock.calls.length || res.json.mock.calls.length || res.send.mock.calls.length) {
      break;
    }
  }
};

module.exports = {
  createMockResponse,
  runMiddlewares
};
