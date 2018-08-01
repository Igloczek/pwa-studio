import { createActions } from 'redux-actions';
import { RestApi } from '@magento/peregrine';

import { closeDrawer, toggleDrawer } from 'src/actions/app';
import checkoutActions from 'src/actions/checkout';

const prefix = 'CART';
const actionTypes = ['ADD_ITEM', 'CREATE_GUEST_CART', 'GET_CART_DETAILS'];

const actions = createActions(...actionTypes, { prefix });
export default actions;

/* async action creators */

const { request } = RestApi.Magento2;

export const createGuestCart = () =>
    async function thunk(dispatch, getState) {
        const { checkout } = getState();

        if (checkout && checkout.status === 'ACCEPTED') {
            dispatch(checkoutActions.resetCheckout());
        }

        try {
            const response = await request('/rest/V1/guest-carts', {
                method: 'POST'
            });

            dispatch(actions.createGuestCart(response));
        } catch (error) {
            dispatch(actions.createGuestCart(error));
        }
    };

export const addItemToCart = (payload = {}) => {
    const { item, quantity } = payload;

    return async function thunk(dispatch) {
        const guestCartId = await getGuestCartId(...arguments);

        try {
            const cartItem = await request(
                `/rest/V1/guest-carts/${guestCartId}/items`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        cartItem: {
                            qty: quantity,
                            sku: item.sku,
                            name: item.name,
                            quote_id: guestCartId
                        }
                    })
                }
            );

            dispatch(actions.addItemToCart({ cartItem, item, quantity }));
        } catch (error) {
            const { response } = error;

            if (response && response.status === 404) {
                // guest cart expired!
                await dispatch(createGuestCart());
                // re-execute this thunk
                return thunk(...arguments);
            }

            dispatch(actions.addItemToCart(error));
        }

        await Promise.all([
            dispatch(getCartDetails({ forceRefresh: true })),
            dispatch(toggleCart())
        ]);
    };
};

export const getCartDetails = (payload = {}) => {
    const { forceRefresh } = payload;

    return async function thunk(dispatch) {
        const guestCartId = await getGuestCartId(...arguments);

        try {
            const [details, totals] = await Promise.all([
                fetchCartPart({ guestCartId, forceRefresh }),
                fetchCartPart({
                    guestCartId,
                    forceRefresh,
                    subResource: 'totals'
                })
            ]);

            dispatch(actions.getCartDetails({ details, totals }));
        } catch (error) {
            const { response } = error;

            if (response && response.status === 404) {
                // guest cart expired!
                await dispatch(createGuestCart());
                // re-execute this thunk
                return thunk(...arguments);
            }

            dispatch(actions.getCartDetails(error));
        }
    };
};

export const toggleCart = () =>
    async function thunk(dispatch, getState) {
        const { app, cart } = getState();

        // ensure state slices are present
        if (!app || !cart) {
            return;
        }

        // if the cart drawer is open, close it
        if (app.drawer === 'cart') {
            await dispatch(closeDrawer());
            return;
        }

        // otherwise open the cart and load its contents
        await Promise.all([
            dispatch(getCartDetails()),
            dispatch(toggleDrawer('cart'))
        ]);
    };

/* helpers */

async function fetchCartPart({ guestCartId, forceRefresh, subResource = '' }) {
    if (!guestCartId) {
        return null;
    }

    return request(`/rest/V1/guest-carts/${guestCartId}/${subResource}`, {
        cache: forceRefresh ? 'reload' : 'default'
    });
}

export async function getGuestCartId(dispatch, getState) {
    const { cart } = getState();

    // ensure state slices are present
    if (!cart) {
        return null;
    }

    // create a guest cart if one hasn't been created yet
    if (!cart.guestCartId) {
        await dispatch(createGuestCart());
    }

    // retrieve app state again
    return getState().cart.guestCartId;
}
