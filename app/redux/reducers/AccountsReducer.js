import {
  FETCH_ACCOUNTS_ASYNC,
  ACCOUNT_FIELD_CHANGED,
  ACCOUNT_FIELD_ERROR,
  VALIDATE_TRANSACTION,
  SET_TRANSACTION_TYPE,
  SET_TRANSACTION_CURRENCY,
  RESET_TRANSACTION,
  SEND_ASYNC,
  SET_WITHDRAW_STATE,
  WITHDRAW_ASYNC,
  SET_WITHDRAW_WALLET,
  SET_WITHDRAW_BANK_ACCOUNT,
  RESET_WITHDRAW,
  VIEW_WALLET,
  HIDE_WALLET,
  SHOW_MODAL,
  FETCH_TRANSACTIONS_ASYNC,
  SET_HOME_ACCOUNT,
  SET_HOME_CURRENCY,
  SET_TRANSACTION_STATE,
  CONTACT_FIELD_CHANGED,
} from '../actions';
import { PERSIST_REHYDRATE } from 'redux-persist/es/constants';
import { createSelector } from 'reselect';
import { accountsSelector, cryptoSelector } from './../sagas/selectors';

const INITIAL_STATE = {
  accounts: [],
  activeWalletIndex: 0,
  transactions: {},

  loading: false,
  loadingActiveCurrencyChange: false,

  transactionAmount: '0',
  transactionCurrency: null,
  transactionRecipient: '',
  transactionNote: '',
  transactionMemo: '',
  transactionReference: null,

  tempWallet: null,
  showWallet: false,
};

export default (state = INITIAL_STATE, action) => {
  // console.log(action);
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return action.payload.auth || INITIAL_STATE;

    case CONTACT_FIELD_CHANGED:
    case ACCOUNT_FIELD_CHANGED:
      return {
        ...state,
        [action.payload.prop]: action.payload.value,
        transactionAmountError: '',
        transactionRecipientError: '',
      };
    case ACCOUNT_FIELD_ERROR:
      return {
        ...state,
        sendError: action.payload,
        withdrawError: action.payload,
      };

    case FETCH_ACCOUNTS_ASYNC.pending:
      return {
        ...state,
        loading: true,
        error: '',
      };
    case FETCH_ACCOUNTS_ASYNC.success:
      return {
        ...state,
        accounts: action.payload,
        loading: false,
        error: '',
      };
    case FETCH_ACCOUNTS_ASYNC.error:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_TRANSACTIONS_ASYNC.pending:
      return {
        ...state,
        transactionsLoading: true,
      };
    case FETCH_TRANSACTIONS_ASYNC.success:
      const { transactions, filters } = action.payload;
      const { account, currency } = filters;
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [account]: {
            ...(state.transactions && state.transactions[account]
              ? state.transactions[account]
              : null),
            [currency]: transactions,
          },
        },
        transactionsLoading: false,
      };
    case FETCH_TRANSACTIONS_ASYNC.error:
      return {
        ...state,
        transactionsLoading: false,
      };

    // case SET_HOME_ACCOUNT:
    //   return {
    //     ...state,
    //     homeAccount: action.payload,
    //   };
    case SET_HOME_CURRENCY:
      return {
        ...state,
        homeCurrency: action.payload,
      };

    case SHOW_MODAL:
      if (action.payload.type === 'wallet') {
        return {
          ...state,
          tempWallet: action.payload.item,
        };
      }
      return { ...state };

    case SET_TRANSACTION_TYPE:
      return {
        ...state,
        transactionType: action.payload,
        transactionState: '',
      };
    case SET_TRANSACTION_STATE:
      return {
        ...state,
        transactionState: action.payload,
      };
    case SET_TRANSACTION_CURRENCY:
      return {
        ...state,
        transactionWallet: action.payload,
      };

    case RESET_TRANSACTION:
      return {
        ...state,
        transactionState: '',
        transactionAmount: '',
        transactionCurrency: '',
        transactionRecipient: '',
        transactionNote: '',
        transactionReference: '',
        transactionState: 'amount',
        transactionError: '',
        transactionMemo: '',
        transactionType: '',
      };

    case VALIDATE_TRANSACTION.pending:
      return {
        ...state,
        transactionLoading: true,
      };
    case VALIDATE_TRANSACTION.success:
      return {
        ...state,
        ...action.payload,
        transactionLoading: false,
      };
    case VALIDATE_TRANSACTION.error:
      return {
        ...state,
        transactionState: '',
        transactionError: action.payload,
        transactionLoading: false,
      };

    case SEND_ASYNC.pending:
      return {
        ...state,
        transactionLoading: true,
      };
    case SEND_ASYNC.success:
      return {
        ...state,
        transactionState: 'success',
        transactionLoading: false,
      };
    case SEND_ASYNC.error:
      return {
        ...state,
        transactionState: 'fail',
        transactionError: action.payload,
        transactionLoading: false,
      };

    case SET_WITHDRAW_WALLET:
      return {
        ...state,
        withdrawAmount: '',
        withdrawBankAccount: null,
        withdrawNote: '',
        withdrawWallet: action.payload,
        withdrawState: 'amount',
        withdrawError: '',
      };
    case SET_WITHDRAW_STATE:
      return {
        ...state,
        withdrawState: action.payload,
        withdrawError: '',
      };
    case SET_WITHDRAW_BANK_ACCOUNT:
      return {
        ...state,
        withdrawBankAccount: action.payload,
        withdrawError: '',
      };

    case RESET_WITHDRAW:
      return {
        ...state,
        withdrawAmount: '',
        withdrawWallet: null,
        withdrawBankAccount: null,
        withdrawNote: '',
        withdrawAccountName: '',
        withdrawState: 'amount',
        withdrawError: '',
      };
    case WITHDRAW_ASYNC.pending:
      return {
        ...state,
        withdrawing: true,
      };
    case WITHDRAW_ASYNC.success:
      return {
        ...state,
        withdrawState: 'success',
        withdrawing: false,
      };
    case WITHDRAW_ASYNC.error:
      return {
        ...state,
        withdrawState: 'fail',
        withdrawError: action.payload,
        withdrawing: false,
      };

    case VIEW_WALLET:
      return {
        ...state,
        showWallet: true,
        tempWallet: action.payload,
        // sendWallet: action.payload,
        // sendState: 'amount',
        // sendError: '',
      };
    case HIDE_WALLET:
      return {
        ...state,
        tempWallet: null,
        showWallet: false,
      };

    // case LOGOUT_USER:
    //   return INITIAL_STATE;
    default:
      return state;
  }
};

export const currenciesSelector = createSelector(
  [accountsSelector, cryptoSelector],
  (accountsState, cryptoState) => {
    const { accounts, loading, error } = accountsState;

    let activeCurrency = '';

    let currencies = [];
    let tempCurrencies = [];
    for (i = 0; i < accounts.length; i++) {
      tempCurrencies = accounts[i].currencies.map(currency => {
        currency.account = accounts[i].reference;
        const currencyCode = currency.currency.code;
        if (cryptoState.stellar.currencies.indexOf(currencyCode) !== -1) {
          currency.crypto = 'stellar';
        } else if (
          cryptoState.bitcoin.currencies.indexOf(currencyCode) !== -1
        ) {
          currency.crypto = 'bitcoin';
        } else if (
          cryptoState.ethereum.currencies.indexOf(currencyCode) !== -1
        ) {
          currency.crypto = 'ethereum';
        } else {
          currency.crypto = '';
        }
        if (currency.active) {
          activeCurrency = currency.currency.code;
        }

        // console.log('active' + currency.active);
        return currency;
      });
      currencies = currencies.concat(tempCurrencies);
    }

    const activeIndex = currencies.findIndex(
      item => item.currency.code === activeCurrency,
    );

    if (currencies.length > 0) {
      const activeItem = currencies[activeIndex];
      currencies[activeIndex] = currencies[0];
      currencies[0] = activeItem;
    }

    return {
      data: currencies,
      loading,
      error,
    };
  },
);

export const transactionSelector = createSelector(
  [accountsSelector, cryptoSelector],
  accountsState => {
    const {
      transactionState,
      transactionType,
      transactionCurrency,
      transactionAmount,
      transactionAmountError,
      transactionRecipient,
      transactionRecipientError,
      transactionMemo,
      transactionNote,
      transactionLoading,
      transactionError,
    } = accountsState;

    return {
      state: transactionState,
      type: transactionType,
      currency: transactionCurrency,
      amount: transactionAmount,
      amountError: transactionAmountError,
      recipient: transactionRecipient,
      recipientError: transactionRecipientError,
      memo: transactionMemo,
      note: transactionNote,
      loading: transactionLoading,
      error: transactionError,
    };
  },
);

export const homeSelector = createSelector(
  [accountsSelector],
  accountsState => {
    const { homeCurrency } = accountsState;

    return {
      currency: homeCurrency ? homeCurrency : {},
    };
  },
);
