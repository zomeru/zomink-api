import UserModel from '../models/user.model';

export async function increaseTokenVersion(userId: string) {
  // find one and update
  const user = await UserModel.findOneAndUpdate(
    { id: userId },
    { $inc: { tokenVersion: 1 } },
    { new: true }
  );

  if (!user) {
    throw new Error('Error updating user');
  }

  // return user;
}
