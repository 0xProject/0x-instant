import { asyncData } from '../redux/async_data';
import { Store } from '../redux/store';
import { QuoteFetchOrigin } from '../types';

import { Heartbeater } from './heartbeater';

export interface HeartbeatFactoryOptions {
    store: Store;
    shouldPerformImmediatelyOnStart: boolean;
}
export const generateAccountHeartbeater = (options: HeartbeatFactoryOptions): Heartbeater => {
    const { store, shouldPerformImmediatelyOnStart } = options;
    return new Heartbeater(async () => {
        await asyncData.fetchAccountInfoAndDispatchToStore(store.getState().providerState, store.dispatch, false, store.getState().selectedTokenIn, store.getState().selectedTokenOut );
    }, shouldPerformImmediatelyOnStart);
};

export const generateSwapQuoteHeartbeater = (options: HeartbeatFactoryOptions): Heartbeater => {
    const { store, shouldPerformImmediatelyOnStart } = options;
    return new Heartbeater(async () => {
        await asyncData.fetchCurrentApiSwapQuoteAndDispatchToStore(
            store.getState(),
            store.dispatch,
            QuoteFetchOrigin.Heartbeat,
            {
                updateSilently: true,
            },
        );
    }, shouldPerformImmediatelyOnStart);
};
