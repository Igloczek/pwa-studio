import actions from 'src/actions/app';

const initialState = {
    drawer: null,
    overlay: false,
    pending: {}
};

const reducer = (state = initialState, { payload, type }) => {
    switch (type) {
        case [actions.toggleDrawer]: {
            return {
                ...state,
                drawer: payload,
                overlay: !!payload
            };
        }
        default: {
            return state;
        }
    }
};

const selectAppState = ({ app }) => ({ app });

export { reducer as default, selectAppState };
