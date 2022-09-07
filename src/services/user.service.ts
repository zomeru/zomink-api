import UserModel, { User } from '../models/user.model';

export async function createUser(input: Partial<User>) {
  return UserModel.create(input);
}

export function findUserById(id: string) {
  return UserModel.findById(id);
}

export function findUserByEmail(email: string) {
  return UserModel.findOne({ email });
}

export function findUserByEmailOrUsername(emailOrUsername: string) {
  return UserModel.findOne({
    $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
  });
}

export function findByUserIdAndUpdate(id: string, input: Partial<User>) {
  return UserModel.findByIdAndUpdate(id, input, { new: true });
}
