/** @format */

import { context, PersistentMap } from 'near-sdk-as'
import { maxBaseValue, maxLevel, pokemonValues } from './constants'
import { randomBaseValue } from './helpers'

@nearBindgen
export class PokemonIdList {
    constructor(public id: Array<string>) {}
}

@nearBindgen
export class Pokemon {
    owner: string
    baseHealth: i32
    baseAttack: i32
    baseDefense: i32
    baseSpeed: i32
    level: i32 = 5
    currentHealth: i32

    constructor(
        public id: string,
        public nickname: string,
        public type: string
    ) {
        this.owner = context.sender
        this.baseHealth = randomBaseValue()
        this.baseAttack = randomBaseValue()
        this.baseDefense = randomBaseValue()
        this.baseSpeed = randomBaseValue()
        this.currentHealth = this.serialized.health
    }

    get name(): string {
        return this.nickname.length > 0 ? this.nickname : this.type.toString()
    }

    get serialized(): SerializedPokemon {
        return new SerializedPokemon(this)
    }

    public heal(): void {
        this.currentHealth = this.serialized.health
    }
}

@nearBindgen
export class SerializedPokemon {
    health: i32 = 0
    attack: i32 = 0
    defense: i32 = 0
    speed: i32 = 0
    owner: string
    id: string
    nickname: string
    name: string
    type: string
    baseHealth: i32
    baseAttack: i32
    baseDefense: i32
    baseSpeed: i32
    level: i32
    currentHealth: i32

    constructor(pokemon: Pokemon) {
        this.owner = pokemon.owner
        this.id = pokemon.id
        this.nickname = pokemon.nickname
        this.name = pokemon.name
        this.type = pokemon.type
        this.level = pokemon.level
        this.baseHealth = pokemon.baseHealth
        this.baseAttack = pokemon.baseAttack
        this.baseDefense = pokemon.baseDefense
        this.baseSpeed = pokemon.baseSpeed
        this.currentHealth = pokemon.currentHealth
        const numValues = pokemonValues.length
        for (let i = 0; i < numValues; i++) {
            const value = pokemonValues[i]
            if (value.type == this.type) {
                const healthRange = value.healthRange
                const healthDiff = healthRange[1] - healthRange[0]
                this.health =
                    (((healthDiff * pokemon.baseHealth) / maxBaseValue +
                        healthRange[0]) *
                        this.level) /
                    maxLevel

                const attackRange = value.attackRange
                const attackDiff = attackRange[1] - attackRange[0]
                this.attack =
                    (((attackDiff * pokemon.baseAttack) / maxBaseValue +
                        attackRange[0]) *
                        this.level) /
                    maxLevel

                const defenseRange = value.defenseRange
                const defenseDiff = defenseRange[1] - defenseRange[0]
                this.defense =
                    (((defenseDiff * pokemon.baseDefense) / maxBaseValue +
                        defenseRange[0]) *
                        this.level) /
                    maxLevel

                const speedRange = value.speedRange
                const speedDiff = speedRange[1] - speedRange[0]
                this.speed =
                    (((speedDiff * pokemon.baseSpeed) / maxBaseValue +
                        speedRange[0]) *
                        this.level) /
                    maxLevel

                break
            }
        }
    }
}

export class PokemonValue {
    constructor(
        public type: string,
        public healthRange: i32[],
        public attackRange: i32[],
        public defenseRange: i32[],
        public speedRange: i32[]
    ) {}
}

// key => pokemon id in Unit8Array; value => pokemon
export const pokemonMap = new PersistentMap<Uint8Array, Pokemon>('m')

// key => ownerId; value => list of ids of pokemon
export const pokemonByOwner = new PersistentMap<string, PokemonIdList>('o')

// key => 'all'; value => list of all the pokemon ids
export const orderedPokemonList = new PersistentMap<string, PokemonIdList>('l')
