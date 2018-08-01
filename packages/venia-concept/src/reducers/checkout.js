import actions from 'src/actions/checkout';

const initialState = {
    shippingInformation: false,
    status: 'READY',
    subflow: null
};

const reducer = (state = initialState, { payload, type }) => {
    switch (type) {
        case [actions.receiveOrder]: {
            return {
                ...state,
                status: 'MODIFYING'
            };
        }
        case 'ENTER_SUBFLOW': {
            return {
                ...state,
                status: 'MODIFYING',
                subflow: payload
            };
        }
        case 'EXIT_SUBFLOW': {
            return {
                ...state,
                status: 'MODIFYING',
                subflow: null
            };
        }
        case [actions.submitShippingInformation]: {
            return {
                ...state,
                shippingInformation: true
            };
        }
        case [actions.submitOrder]: {
            return {
                ...state,
                status: 'SUBMITTING'
            };
        }
        case [actions.rejectOrder]: {
            return {
                ...state,
                status: 'MODIFYING'
            };
        }
        case [actions.acceptOrder]: {
            return {
                ...state,
                status: 'ACCEPTED'
            };
        }
        case [actions.resetCheckout]: {
            return initialState;
        }
        default: {
            return state;
        }
    }
};

const selectCheckoutState = ({ checkout }) => ({ checkout });

export { reducer as default, selectCheckoutState };
