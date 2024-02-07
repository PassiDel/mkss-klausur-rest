import { PrismaClient } from '@prisma/client';

export async function main(prisma: PrismaClient) {
  const toCreate = [
    prisma.user.upsert({
      where: { id: 1 },
      update: {
        role: 1
      },
      create: {
        login: 'alice@prisma.io',
        password: 'Alice',
        role: 1
      }
    }),
    prisma.user.upsert({
      where: { id: 2 },
      update: {
        role: 2
      },
      create: {
        login: 'driver@prisma.io',
        password: 'Driver',
        role: 2
      }
    }),
    prisma.user.upsert({
      where: { id: 3 },
      update: {
        role: 0
      },
      create: {
        login: 'admin@prisma.io',
        password: 'Admin',
        role: 0
      }
    }),
    prisma.parcel.upsert({
      where: { id: 1 },
      update: {
        status: 'NEW',
        sender: 'Address #1',
        receipient: 'Address #2',
        dropoffPerms: null,
        schedule: null
      },
      create: {
        status: 'NEW',
        sender: 'Address #1',
        receipient: 'Address #2',
        dropoffPerms: null,
        schedule: null
      }
    }),

    prisma.parcel.upsert({
      where: { id: 2 },
      update: {
        status: 'SCHEDULED',
        sender: 'Address #3',
        receipient: 'Address #4',
        dropoffPerms: null,
        schedule: new Date()
      },
      create: {
        status: 'SCHEDULED',
        sender: 'Address #3',
        receipient: 'Address #4',
        dropoffPerms: null,
        schedule: new Date()
      }
    }),
    prisma.parcel.upsert({
      where: { id: 3 },
      update: {
        status: 'SCHEDULED',
        sender: 'Address #3',
        receipient: 'Address #4',
        schedule: new Date(),
        dropoffPerms: 'Neighbour'
      },
      create: {
        status: 'SCHEDULED',
        sender: 'Address #3',
        receipient: 'Address #4',
        schedule: new Date(),
        dropoffPerms: 'Neighbour'
      }
    }),
    prisma.parcel.upsert({
      where: { id: 4 },
      update: {
        status: 'IN_DELIVERY',
        sender: 'Address #3',
        receipient: 'Address #4',
        schedule: new Date(),
        dropoffPerms: null
      },
      create: {
        status: 'IN_DELIVERY',
        sender: 'Address #3',
        receipient: 'Address #4',
        schedule: new Date(),
        dropoffPerms: null
      }
    }),
    prisma.parcel.upsert({
      where: { id: 4 },
      update: {
        status: 'IN_DELIVERY',
        sender: 'Address #3',
        receipient: 'Address #4',
        schedule: new Date(),
        dropoffPerms: 'Neighbour'
      },
      create: {
        status: 'IN_DELIVERY',
        sender: 'Address #3',
        receipient: 'Address #4',
        schedule: new Date(),
        dropoffPerms: 'Neighbour'
      }
    })
  ];

  for (let create of toCreate) {
    const result = await create;
    if (process.env.NODE_ENV !== 'test') {
      console.log(result);
    }
  }
}
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    const prisma = new PrismaClient();
    await main(prisma)
      .then(async () => {
        await prisma.$disconnect();
      })
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });
  })();
}
