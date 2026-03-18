import { SetMetadata } from '@nestjs/common';

export const UNAUTHENTICATED_KEY = 'unauthenticated';
export const Unauthenticated = () => SetMetadata(UNAUTHENTICATED_KEY, true);
