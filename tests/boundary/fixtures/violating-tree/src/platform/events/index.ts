// rule 5: SQL client imported outside adapters/postgres and db/**
import pg from 'pg';
export const events = pg;
