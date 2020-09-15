import {
  CONTACT_GET_LIST,
  CONTACT_LIST_SHOWING,
  CONTACT_MODAL_CREATE_GROUP_SHOWING,
  CONTACT_ADDING,
  CONTACT_ADD,
  CONTACT_CHATTING,
  CONTACT_BLOCK, CONTACTS_LIST_CHANGE, CONTACT_GET_LIST_PARTIAL, THREAD_GET_MESSAGE_LIST_PARTIAL
} from "../constants/actionTypes";
import {listUpdateStrategyMethods, stateGenerator, stateGeneratorState, updateStore} from "../utils/storeHelper";

const {PENDING, SUCCESS, ERROR, CANCELED} = stateGeneratorState;

export const contactGetListReducer = (state = {
  contacts: [],
  hasNext: false,
  nextOffset: 0,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  /*  function sortContacts(contacts) {
      if (contacts.length) {
        contacts = contacts.sort((a, b) => {
          if (!a.firstName) {
            return
          }
          return a.firstName.localeCompare(b.firstName);
        });
      }
      return contacts;
    }*/

  switch (action.type) {
    case CONTACT_GET_LIST(CANCELED):
      return {...state, ...stateGenerator(CANCELED, {hasNext: false, nextOffset: 0})};
    case CONTACT_GET_LIST(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case CONTACTS_LIST_CHANGE: {
      return {
        ...state, ...stateGenerator(SUCCESS, updateStore(state.contacts, action.payload, {
          by: "id",
          upsert: true,
          method: listUpdateStrategyMethods.UPDATE
        }), "contacts")
      };
    }
    case CONTACT_GET_LIST(SUCCESS): {
      const {contacts, hasNext, nextOffset} = action.payload;
      return {...state, ...stateGenerator(SUCCESS, {hasNext, nextOffset, contacts: contacts})};
    }
    case CONTACT_GET_LIST_PARTIAL(SUCCESS): {
      const {contacts, hasNext, nextOffset} = action.payload;
      return {...state, ...stateGenerator(SUCCESS, {hasNext, nextOffset, contacts: state.contacts.concat(contacts)})};
    }
    case CONTACT_GET_LIST(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    case CONTACT_ADD(SUCCESS): {
      const contacts = updateStore(state.contacts, action.payload, {
        by: "id",
        upsert: true,
        method: listUpdateStrategyMethods.UPDATE
      });
      return {...state, ...stateGenerator(SUCCESS, contacts, "contacts")};
    }

    default:
      return state;
  }
};

export const contactGetListPartialReducer = (state = {
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case CONTACT_GET_LIST_PARTIAL(CANCELED):
      return {...state, ...stateGenerator(CANCELED)};
    case CONTACT_GET_LIST_PARTIAL(PENDING):
      return {...state, ...stateGenerator(PENDING)};
    case CONTACT_GET_LIST_PARTIAL(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS)};
    default:
      return state;
  }
};

export const contactAdd = (state = {
  contact: null,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case CONTACT_ADD(CANCELED):
      return {...state, ...stateGenerator(CANCELED, {contact: null})};
    case CONTACT_ADD(PENDING):
      return {...state, ...stateGenerator(PENDING, null, "contact")};
    case CONTACT_ADD(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS, action.payload, "contact")};
    case CONTACT_ADD(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const contactBlockReducer = (state = {
  contact: null,
  fetching: false,
  fetched: false,
  error: false
}, action) => {
  switch (action.type) {
    case CONTACT_BLOCK(PENDING):
      return {...state, ...stateGenerator(PENDING, null, "contact")};
    case CONTACT_BLOCK(SUCCESS):
      return {...state, ...stateGenerator(SUCCESS, action.payload, "contact")};
    case CONTACT_BLOCK(ERROR):
      return {...state, ...stateGenerator(ERROR, action.payload)};
    default:
      return state;
  }
};

export const contactAddingReducer = (state = {
  isShowing: false,
  contactEdit: null
}, action) => {
  switch (action.type) {
    case CONTACT_ADDING:
      return {
        isShowing: action.payload.isShowing,
        contactEdit: action.payload.contactEdit
      };
    default:
      return state;
  }
};

export const contactChattingReducer = (state = {
  contact: false
}, action) => {
  switch (action.type) {
    case CONTACT_CHATTING:
      return {contact: action.payload};
    default:
      return state;
  }
};

export const contactListShowingReducer = (state = false, action) => {
  switch (action.type) {
    case CONTACT_LIST_SHOWING:
      return action.payload;
    default:
      return state;
  }
};

export const contactModalCreateGroupShowingReducer = (state = {isShowing: false, isChannel: false}, action) => {
  switch (action.type) {
    case CONTACT_MODAL_CREATE_GROUP_SHOWING:
      return action.payload;
    default:
      return state;
  }
};