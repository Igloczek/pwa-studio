import { handleActions } from 'redux-actions';
import debounce from 'lodash.debounce';

import actions from 'src/actions/cart';
import checkoutActions from 'src/actions/checkout';
import BrowserPersistence from 'src/util/simplePersistence';

export const name = 'cart';

const initialState = {
    details: {},
    guestCartId: null,
    totals: {}
};

export default handleActions(
    {
        [actions.receiveGuestCart]: (state, { payload }) => {
            return {
                ...state,
                guestCartId: payload
            };
        },
        [actions.updateDetails]: (state, { payload, error }) => {
            if (error) {
                return state;
            }

            return {
                ...state,
                ...payload
            };
        },
        [checkoutActions.acceptOrder]: () => {
            return initialState;
        }
    },
    initialState
);

export async function makeCartReducer() {
    const storage = new BrowserPersistence();
    const imagesBySku = (await storage.getItem('imagesBySku')) || {};
    const saveImagesBySkuCache = debounce(
        () => storage.setItem('imagesBySku', imagesBySku),
        1000
    );
    const guestCartId = await storage.getItem('guestCartId');
    const getInitialState = () => ({
        guestCartId,
        details: { items: [] },
        totals: {}
    });
    const reducer = (state = getInitialState(), { error, payload, type }) => {
        switch (type) {
            case [actions.createGuestCart]: {
                // don't await the save, it can happen in the background
                storage.setItem('guestCartId', payload);
                return {
                    ...state,
                    guestCartId: payload
                };
            }
            case [actions.getCartDetails]: {
                return {
                    ...state,
                    ...payload,
                    details: {
                        ...payload.details,
                        items: payload.details.items.map(item => ({
                            ...item,
                            image: item.image || imagesBySku[item.sku] || ''
                        }))
                    }
                };
            }
            case [actions.addItem]: {
                // cart items don't have images in the REST API;
                // this is the most efficient way to manage that,
                // but it should go in a data layer
                const { item } = payload;
                const media = item.media_gallery_entries || [];
                const cartImage =
                    media.find(image => image.position === 1) || media[0];
                if (
                    item.sku &&
                    cartImage &&
                    imagesBySku[item.sku] !== cartImage
                ) {
                    imagesBySku[item.sku] = cartImage;
                    // don't await the save, it can happen in the background
                    saveImagesBySkuCache();
                }
                return {
                    ...state,
                    showError: error
                };
            }
            case [checkoutActions.acceptOrder]: {
                storage.removeItem('guestCartId');
                return {
                    ...getInitialState(),
                    guestCartId: null
                };
            }
            default: {
                return state;
            }
        }
    };
    reducer.selectAppState = ({ cart }) => ({ cart });
    return reducer;
}
