import { CREATE_NEW_ORDER } from '../modules/clients';
import { MOVE_ORDER_NEXT, MOVE_ORDER_BACK } from '../actions/moveOrder';
import { ADD_INGREDIENT } from '../actions/ingredients';

// Реализуйте редьюсер
// Типы экшенов, которые вам нужно обрабатывать уже импортированы
// Обратите внимание на `orders.test.js`.
// Он поможет понять, какие значения должен возвращать редьюсер.

const positions = [
  'clients',
  'conveyor_1',
  'conveyor_2',
  'conveyor_3',
  'conveyor_4',
  'finish'
];

function orderMove(order, move) {
  const idx = positions.indexOf(order.position);
  const moveInt = parseInt(move);

  if (!moveInt || idx === -1) {
    throw Error('wrong argument');
  }

  const newPosition =
    positions[Math.max(Math.min(idx + move, positions.length - 1), 0)];

  if (
    newPosition === 'clients' ||
    (newPosition === 'finish' && order.recipe.length > order.ingredients.length)
  ) {
    return order.position;
  }

  return newPosition;
}

export default (state = [], action) => {
  switch (action.type) {
    case CREATE_NEW_ORDER: {
      const {
        payload: { id, recipe }
      } = action;
      return [
        ...state,
        {
          id,
          recipe,
          position: 'clients',
          ingredients: []
        }
      ];
    }
    case MOVE_ORDER_NEXT: {
      const id = action.payload;

      return state.map(order =>
        order.id === id
          ? {
              ...order,
              position: orderMove(order, 1)
            }
          : order
      );
    }
    case MOVE_ORDER_BACK: {
      const id = action.payload;

      return state.map(order =>
        order.id === id
          ? {
              ...order,
              position: orderMove(order, -1)
            }
          : order
      );
    }
    case ADD_INGREDIENT: {
      const {
        payload: { from, ingredient }
      } = action;

      const newState = [...state];

      const found = newState.find(order => order.position === from);

      if (
        found &&
        found.recipe.includes(ingredient) &&
        !found.ingredients.includes(ingredient)
      ) {
        found.ingredients = [...found.ingredients, ingredient];
      }

      return newState;
    }
    default:
      return state;
  }
};

export const getOrdersFor = (state, position) =>
  state.orders.filter(order => order.position === position);
