import { Response } from 'express';

export async function sendData(
  res: Response,
  data: any,
  statusCode: number,
  statusMsg: 'success' | 'error'
) {
  return res.status(statusCode).send({
    status: statusMsg,
    data,
  });
}
