import URLModel from '../models/url.model';
import type { CreateShortURLInput } from '../schema/url.schema';

export async function createShortURL(input: CreateShortURLInput) {
  return await URLModel.create(input);
}

export function findUrlByLink(link: string) {
  return URLModel.findOne({ link, isCustomAlias: false });
}

export function findUrlByAlias(alias: string) {
  return URLModel.findOne({ alias: { $regex: new RegExp(`^${alias}$`, 'i') } });
}

export function findUrlByUserAndLink(user: string, link: string) {
  return URLModel.findOne({ user, link });
}

export function findUrlsByUserId(id: string) {
  return URLModel.find({ user: id });
}

// export function getAllUrlsByUserId(id: string) {
//   return URLModel.find({ user: id });
// }
