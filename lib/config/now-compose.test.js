const toNowCompose = require('./now-compose')

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
      networks: ['test'],
      links: ['db'],
      depends_on: ['db']
    },
    db: {
      image: 'mysql:5.7',
      ports: ['3306:3306'],
      restart: 'on-failure',
      networks: ['test'],
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
      }
    }
  },
  volumes: {
    'mysql-data': null
  }
}

describe('toNowCompose', () => {
  it('should exclude services that contain build or image config options', () => {
    const nowConfig = toNowCompose(exampleParsedConfig)

    expect(nowConfig.services.web).toBeDefined()
    expect(nowConfig.services.db).not.toBeDefined()
    expect(nowConfig.services.auth).toBeDefined()
    expect(nowConfig.services.api).not.toBeDefined()
  })

  it('should exclude volumes and network config options for a service', () => {
    const nowConfig = toNowCompose(exampleParsedConfig)

    expect(nowConfig.services.auth.volumes).not.toBeDefined()
    expect(nowConfig.services.auth.networks).not.toBeDefined()
  })
})
