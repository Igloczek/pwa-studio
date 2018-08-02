import { createActions } from 'redux-actions';

import { store } from 'src';
import timeout from 'src/util/timeout';
import { drawerClose, drawerOpen } from 'src/shared/durations';

const prefix = 'APP';
const actionTypes = ['TOGGLE_DRAWER'];

const actions = createActions(...actionTypes, { prefix });
export default actions;

/* async action creators */

export const loadReducers = payload =>
    async function thunk() {
        try {
            const reducers = await Promise.all(payload);

            reducers.forEach(({ default: reducer, name }) => {
                store.addReducer(name, reducer);
            });
        } catch (error) {
            console.log(error);
        }
    };

export const toggleDrawer = drawerName => async dispatch => {
    dispatch(actions.toggleDrawer(drawerName));

    return timeout(drawerName ? drawerOpen : drawerClose);
};

export const closeDrawer = () => toggleDrawer(null);
