import {  createStore, combineReducers, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import { provider, contracts } from "./reducers";

const reducer = combineReducers({
    provider,
    contracts
})

const initialState = {}
const middlewares = [ thunk ]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middlewares)))

export default store