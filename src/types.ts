/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Person {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  members: Person[];
}

export type AppTab = 'list' | 'draw' | 'group';
