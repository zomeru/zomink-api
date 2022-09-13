/* eslint-disable camelcase */
import qs from 'qs';
import fetch from 'node-fetch';
import type { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import type { DocumentType } from '@typegoose/typegoose';

import log from '../utils/logger';
import UserModel, { User } from '../models/user.model';

export function createUser(input: Partial<User>) {
  return UserModel.create(input);
}

export function findUserById(id: string) {
  return UserModel.findById(id);
}

export function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export function findUserByEmailWithoutProvider(email: string) {
  return UserModel.findOne({
    email,
    authProvider: 'none',
  });
}

export function findUserByEmailOrUsername(emailOrUsername: string) {
  return UserModel.findOne({
    $or: [
      { username: emailOrUsername, authProvider: 'none' },
      { email: emailOrUsername, authProvider: 'none' },
    ],
  });
}

export function findByUserIdAndUpdate(id: string, input: Partial<User>) {
  return UserModel.findByIdAndUpdate(id, input, { new: true });
}

export interface GoogleTokensResult {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  refresh_token: string;
}

export async function getGoogleOauthTokens({
  code,
}: {
  code: string;
}): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
    grant_type: 'authorization_code',
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: qs.stringify(values),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = (await res.json()) as GoogleTokensResult;

    return data;
  } catch (error: any) {
    log.error(`Error - Failed to fetch Google OAuth Tokens: ${error}`);
    throw new Error(error.message);
  }
}

export interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function getGoogleUserInfo({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}): Promise<GoogleUserResult> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    const data = (await res.json()) as GoogleUserResult;

    return data;
  } catch (error: any) {
    log.error(`Error - Failed to fetch Google User Info: ${error}`);
    throw new Error(error.message);
  }
}

export async function findAndUpdateGoogleUser(
  query: FilterQuery<DocumentType<User>>,
  update: UpdateQuery<DocumentType<User>>,
  options: QueryOptions = {}
) {
  return UserModel.findOneAndUpdate(query, update, options);
}
