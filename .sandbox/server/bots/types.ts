/*
 * SocialExplorer
 * Copyright © 2019-2023 Blue Forest
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

export type BotId = string

export type BotData = {
  name: string
  summary: string
  privateKey: string
  publicKey: string
}

export type FollowerData = {
  bot: BotId
  follower: string
  created: Date
}

export type ObjectData = {
  type: "Note"
  bot: BotId
  content: string
  date: Date
}

export type ActivityData = {
  type: "Create"
  bot: BotId
  object: string
  date: Date
}
