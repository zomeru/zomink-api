import URLModel from '../models/url.model';
import { CreateShortURLInput } from '../schema/url.schema';

export function createShortURL(input: CreateShortURLInput) {
  return URLModel.create(input);
}

export function findUrlByLink(link: string) {
  return URLModel.findOne({ link });
}

export function findUrlByAlias(alias: string) {
  return URLModel.findOne({ alias });
}

export function findUrlByUserAndLink(user: string, link: string) {
  return URLModel.findOne({ user, link });
}

export function findUrlsByUserId(id: string) {
  return URLModel.find({ user: id });
}

export function getAllUrlsByUserId(id: string) {
  return URLModel.find({ user: id });
}
