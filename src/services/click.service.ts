import ClickModel, { Click } from '../models/click.model';
import type { SaveClickInput } from '../schema/click.schema';

export function saveClick(
  urlId: SaveClickInput['params']['urlId'],
  input: Partial<Click>
) {
  return ClickModel.create({
    url: urlId,
    ...input,
  });
}
