import { prisma } from '@/lib/db';

export async function getStoreSettings() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'global' },
  });

  if (!settings) {
    return prisma.storeSettings.create({
      data: {
        id: 'global',
      },
    });
  }

  return settings;
}

export async function saveStoreSettings(data: {
  storeName: string;
  fromEmail: string;
  supportEmail: string;
  primaryLanguage: string;
  storeCurrency: string;
  checkoutProvider: string;
}) {
  await prisma.storeSettings.upsert({
    where: { id: 'global' },
    update: data,
    create: { id: 'global', ...data },
  });
}

export async function getSeoSettings() {
  const settings = await prisma.seoSettings.findUnique({
    where: { id: 'global' },
  });

  if (!settings) {
    return prisma.seoSettings.create({
      data: {
        id: 'global',
      },
    });
  }

  return settings;
}

export async function saveSeoSettings(data: {
  globalSiteTitle: string;
  globalMetaDescription: string;
  defaultOgImage: string;
}) {
  await prisma.seoSettings.upsert({
    where: { id: 'global' },
    update: data,
    create: { id: 'global', ...data },
  });
}

export async function getAdminCollections() {
  return prisma.collection.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function saveAdminCollection(data: {
  slug: string;
  title: string;
  description?: string;
  image?: string;
}) {
  await prisma.collection.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title,
      description: data.description,
      image: data.image,
    },
    create: data,
  });
}
