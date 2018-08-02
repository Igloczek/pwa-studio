import { handleActions } from 'redux-actions';

import actions from 'src/actions/app';

export const name = 'app';

const initialState = {
    drawer: null,
    overlay: false,
    pending: {}
};

export default handleActions(
    {
        [actions.toggleDrawer]: (state, { payload }) => {
            return {
                ...state,
                drawer: payload,
                overlay: !!payload
            };
        }
    },
    initialState
);

export const selectAppState = ({ app }) => ({ app });
