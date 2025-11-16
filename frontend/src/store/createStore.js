import { useEffect, useState } from 'react';

export default function createStore(initializer) {
  let state;
  const listeners = new Set();

  const setState = (partial, replace = false) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = replace ? nextState : { ...state, ...nextState };
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const api = { setState, getState, subscribe };
  state = initializer(setState, getState, api);

  const useBoundStore = (selector = (s) => s, equalityFn = Object.is) => {
    const [slice, setSlice] = useState(() => selector(state));

    useEffect(() => {
      return subscribe((nextState) => {
        const selectedState = selector(nextState);
        setSlice((prev) => (equalityFn(prev, selectedState) ? prev : selectedState));
      });
    }, [selector, equalityFn]);

    return slice;
  };

  useBoundStore.setState = setState;
  useBoundStore.getState = getState;
  useBoundStore.subscribe = subscribe;

  return useBoundStore;
}
