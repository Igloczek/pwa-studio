import { createActions } from 'redux-actions';
import { RestApi } from '@magento/peregrine';

import { closeDrawer } from 'src/actions/app';
import { getGuestCartId } from 'src/actions/cart';

// TODO: replace with real address data
const mockAddress = {
    country_id: 'US',
    firstname: 'Veronica',
    lastname: 'Costello',
    street: ['6146 Honey Bluff Parkway'],
    city: 'Calder',
    postcode: '49628-7978',
    region_id: 33,
    region_code: 'MI',
    region: 'Michigan',
    telephone: '(555) 229-3326',
    email: 'veronica@example.com'
};

const prefix = 'CHECKOUT';
const actionTypes = [
    'RECEIVE_ORDER',
    'RESET_CHECKOUT',
    'ACCEPT_ORDER',
    'REJECT_ORDER',
    'SUBMIT_ORDER',
    'ACCEPT_SHIPPING_INFORMATION',
    'REJECT_SHIPPING_INFORMATION',
    'SUBMIT_SHIPPING_INFORMATION'
];

const actions = createActions(...actionTypes, { prefix });
export default actions;

/* action creators */

const { request } = RestApi.Magento2;

export const enterSubflow = () =>
    async function thunk(dispatch) {
        dispatch(actions.submitShippingInformation());

        try {
            const guestCartId = await getGuestCartId(...arguments);
            const response = await request(
                `/rest/V1/guest-carts/${guestCartId}/shipping-information`,
                {
                    method: 'POST',
                    // TODO: replace with real data from cart state
                    body: JSON.stringify({
                        addressInformation: {
                            billing_address: mockAddress,
                            shipping_address: mockAddress,
                            shipping_method_code: 'flatrate',
                            shipping_carrier_code: 'flatrate'
                        }
                    })
                }
            );

            dispatch(actions.acceptShippingInformation(response));
        } catch (error) {
            dispatch(actions.rejectShippingInformation(error));
        }
    };

export const requestOrder = () => async dispatch => {
    dispatch(actions.receiveOrder());
};

export const resetCheckout = () => async dispatch => {
    await dispatch(closeDrawer());
    dispatch(actions.resetCheckout());
};

export const submitOrder = () =>
    async function thunk(dispatch) {
        dispatch(actions.submitOrder());

        try {
            const guestCartId = await getGuestCartId(...arguments);
            const response = await request(
                `/rest/V1/guest-carts/${guestCartId}/order`,
                {
                    method: 'PUT',
                    // TODO: replace with real data from cart state
                    body: JSON.stringify({
                        paymentMethod: {
                            method: 'checkmo'
                        }
                    })
                }
            );

            dispatch(actions.acceptOrder(response));
        } catch (error) {
            dispatch(actions.rejectOrder(error));
        }
    };
