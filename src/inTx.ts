import { EntityManager, getConnection } from "typeorm";
export type Tx = EntityManager;

const stateSymbol = Symbol();
type TxState = { after: (() => any | Promise<any>)[], before: (() => any | Promise<any>)[], cache: any };

function createState(): TxState {
    return { after: [], before: [], cache: {} };
}

function getState(tx: Tx) {
    let ex = (tx as any)[stateSymbol] as TxState | undefined;
    if (!ex) {
        throw Error('Unable to find state');
    }
    return ex;
}

export function getTxCache(tx: Tx, key: symbol) {
    let cache = getState(tx).cache;
    let res = cache[key];
    if (!res) {
        res = {};
        cache[key] = res;
    }
    return res;
}

export function afterCommit(tx: Tx, handler: () => any | Promise<any>) {
    getState(tx).after.push(handler);
}

export function beforeCommit(tx: Tx, handler: () => any | Promise<any>) {
    getState(tx).before.push(handler);
}

export async function inTx<T>(handler: (tx: Tx) => Promise<T>): Promise<T> {
    let state = createState();
    let txRes = await getConnection().transaction('REPEATABLE READ', async (tx) => {
        (tx as any)[stateSymbol] = state;

        let res = await handler(tx);

        // Before commit hook
        if (state.before.length > 0) {
            for (let before of [...state.before]) {
                await before();
            }
        }

        return res;
    });

    // After commit hook
    if (state.after.length > 0) {
        for (let after of [...state.after]) {
            await after();
        }
    }
    return txRes;
}