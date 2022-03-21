import sub from 'date-fns/sub';
import { OrderType } from 'src/posts/dto/post.dto';

export function getSubDateBasedOnOrderType(orderType: OrderType) {
  let until: Date | undefined;
  switch (orderType) {
    case OrderType.TOP_1DAY:
      until = sub(new Date(), { days: 1 });
      break;
    case OrderType.TOP_1WEEK:
      until = sub(new Date(), { weeks: 1 });
      break;
    case OrderType.TOP_1MONTH:
      until = sub(new Date(), { months: 1 });
      break;
    case OrderType.TOP_1YEAR:
      until = sub(new Date(), { years: 1 });
      break;

    default:
      until = undefined;
      break;
  }

  return until;
}
