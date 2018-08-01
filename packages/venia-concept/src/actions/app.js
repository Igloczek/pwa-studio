import { createActions } from 'redux-actions';

import timeout from 'src/util/timeout';
import { drawerClose, drawerOpen } from 'src/shared/durations';

const prefix = 'APP';
const actionTypes = ['TOGGLE_DRAWER'];

const actions = createActions(...actionTypes, { prefix });
export default actions;

/* async action creators */

export const toggleDrawer = drawerName => async dispatch => {
    dispatch(actions.toggleDrawer(drawerName));

    return timeout(drawerName ? drawerOpen : drawerClose);
};

export const closeDrawer = () => toggleDrawer(null);
