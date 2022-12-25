/*
 * SocialExplorer
 * Copyright © 2019-2022 Blue Forest
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

export type BotName = string

export type BotData = {
  name: BotName
  privKey: string
  pubKey: string
  created: Date
}

export type FollowerData = {
  bot: BotName
  follower: string
  created: Date
}

export type MessageData = {
  id: string
  bot: BotName
  date: Date
  content: string
}
