const toDockerCompose = require('./docker-compose')

const exampleParsedConfig = {
  version: '3',
  services: {
    api: {
      build: './api',
      ports: ['8081:8080'],
      restart: 'on-failure',
      links: ['auth', 'db'],
      depends_on: ['auth', 'db'],
      environment: {
        PORT: ':8080',
        MYSQL_DB: 'test',
        MYSQL_USER: 'test',
        MYSQL_PASSWORD: 'test',
        MYSQL_HOST: 'test'
      },
      deploy: 'Should not be in config'
    },
    web: {
      ports: ['8080:3000'],
      restart: 'on-failure',
      links: ['auth'],
      depends_on: ['auth'],
      volumes: ['./web:/usr/src/app', '/usr/src/app/node_modules'],
      command: 'npm run dev'
    },
    auth: {
      ports: ['8080:8080'],
      restart: 'on-failure',
      volumes: ['./auth:/usr/src/app', '/usr/src/app/node_modules'],
      environment: {
        PORT: '8080',
        MYSQL_DB: 'test',
        MYSQL_USER: 'test',
        MYSQL_PASSWORD: 'test',
        MYSQL_HOST: 'test',
        NODE_ENV: 'production'
      },
      links: ['db'],
      depends_on: ['db']
    },
    db: {
      image: 'mysql:5.7',
      ports: ['3306:3306', '5555:5555'],
      restart: 'on-failure',
      volumes: [
        './setup/db:/docker-entrypoint-initdb.d',
        'mysql-data:/var/lib/mysql'
      ],
      environment: {
        MYSQL_DATABASE: 'test',
        MYSQL_USER: 'test',
        MYSQL_PASSWORD: 'test',
        MYSQL_ROOT_PASSWORD: 'test',
        MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
        MYSQL_ROOT_HOST: '%'
      },
      env_file: 'env.txt'
    }
  },
  volumes: {
    'mysql-data': null
  }
}

describe('toDockerCompose', () => {
  it('should exclude services that do not contain build or image config options', () => {
    const dockerConfig = toDockerCompose(exampleParsedConfig)

    expect(dockerConfig.services.web).not.toBeDefined()
    expect(dockerConfig.services.db).toBeDefined()
    expect(dockerConfig.services.auth).not.toBeDefined()
    expect(dockerConfig.services.api).toBeDefined()
  })

  it('should exclude "deploy" config options for a service', () => {
    const dockerConfig = toDockerCompose(exampleParsedConfig)

    expect(dockerConfig.services.api.deploy).not.toBeDefined()
  })

  it('should set host env vars on linked services correctly', () => {
    const dockerConfig = toDockerCompose(exampleParsedConfig)
    const apiEnvVars = dockerConfig.services.api.environment

    expect(apiEnvVars['NOW_HOST_AUTH']).not.toBeDefined()
    expect(apiEnvVars['NOW_HOST_DB']).toEqual('host.docker.internal')
    expect(apiEnvVars['NOW_PORT_DB']).toEqual('3306')
  })

  it('should only set the first port defined when linking services', () => {
    const dockerConfig = toDockerCompose(exampleParsedConfig)
    const apiEnvVars = dockerConfig.services.api.environment

    expect(apiEnvVars['NOW_PORT_DB']).toEqual('3306')
  })

  it('should fix path of env files to be at project root', () => {
    const dockerConfig = toDockerCompose(exampleParsedConfig)

    expect(dockerConfig.services.db['env_file']).toEqual('../env.txt')
  })

  it('should fix path of build tag to be at project root', () => {
    const dockerConfig = toDockerCompose(exampleParsedConfig)

    expect(dockerConfig.services.api.build).toEqual('../api')
  })

  it('should require at least docker-compose config version 3', () => {
    let oldVersionConfig = exampleParsedConfig
    oldVersionConfig.version = '2'

    expect(() => {
      const dockerConfig = toDockerCompose(oldVersionConfig)
    }).toThrow()
  })
})
