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

import { RouterContext } from "https://deno.land/x/oak/mod.ts"
import { generateKeyPair as generate } from "https://deno.land/x/jose/index.ts"

export function handleResponse(
  context: RouterContext<any, any, any>,
  response?: any,
) {
  if(response) {
    context.response.body = response
  }
}

export async function generateKeyPair(): Promise<{ public: string, private: string }> {
  const key = await generate("RS256", {
    modulusLength: 4096,
  })
  return {
    public: `-----BEGIN PUBLIC KEY-----\n${key.publicKey}\n-----END PUBLIC KEY-----`,
    private: `-----BEGIN PRIVATE KEY-----\n${key.privateKey}\n-----END PRIVATE KEY-----`,
  }
}
