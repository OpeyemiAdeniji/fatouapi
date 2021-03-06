import express, { Router, Request, Response, NextFunction } from 'express';

import {
    registerRecruiter,
    addRecruiters
} from '../../../controllers/auth.controller'

import { validateChannels as vcd } from '../../../middleware/header.mw'

const router: Router = express.Router({ mergeParams: true });
import { protect, authorize } from '../../../middleware/auth.mw';

const roles = ['superadmin', 'admin']
const allRoles = ['superadmin', 'admin', 'user'];

router.post('/register', vcd, registerRecruiter);
router.post('/recruiters', vcd, addRecruiters);

export default router;