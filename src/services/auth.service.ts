import { nanoid } from 'nanoid';
import UserModel from '../models/user.model';

export async function updateTokenVersion(userId: string) {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { tokenVersion: nanoid() },
    { new: true }
  );

  if (user == null) {
    throw new Error('Error updating user');
  }
}
