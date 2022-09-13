import express from 'express';

import { saveClickSchema } from '../schema/click.schema';
import { saveClickHandler } from '../controllers/click.controller';
import validateResource from '../middlewares/validateResource';

const router = express.Router();

router.post(
  '/clicks/:urlId',
  validateResource(saveClickSchema),
  saveClickHandler
);

export default router;
