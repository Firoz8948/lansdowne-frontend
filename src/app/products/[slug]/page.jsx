import { notFound } from 'next/navigation';
import JsonLd from '@/components/Seo/JsonLd';
import {
  BRAND,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
  cleanProductName,
  fetchApi,
} from '@/lib/seo';
import ProductDetailClient from './ProductDetailClient';

async function loadProduct(slug) {
  const [productRes, defsRes] = await Promise.all([
    fetchApi(`/products/${encodeURIComponent(slug)}`, { revalidate: 0 }),
    fetchApi('/metafields/', { revalidate: 300 }),
  ]);
  return {
    product: productRes.ok ? productRes.data : null,
    missing: productRes.status === 404,
    defs: Array.isArray(defsRes.data) ? defsRes.data : [],
  };
}

export async function generateMetadata({ params }) {
  const { product, missing, defs } = await loadProduct(params.slug);
  if (!product) {
    return {
      title: { absolute: missing ? `Product not found | ${BRAND}` : BRAND },
      robots: { index: false, follow: true },
    };
  }
  return buildProductMetadata(product, defs);
}

export default async function ProductPage({ params, searchParams }) {
  const { product, missing, defs } = await loadProduct(params.slug);
  if (missing) notFound();

  const breadcrumbs = product
    ? [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        ...(product.category && product.category_slug
          ? [{ name: product.category, path: `/shop?category=${product.category_slug}` }]
          : []),
        { name: cleanProductName(product.name), path: `/products/${product.slug}` },
      ]
    : null;

  return (
    <>
      {product && (
        <JsonLd data={[buildProductJsonLd(product, defs), buildBreadcrumbJsonLd(breadcrumbs)]} />
      )}
      <ProductDetailClient
        key={params.slug}
        initialProduct={product}
        initialDefs={defs}
        initialColor={typeof searchParams?.color === 'string' ? searchParams.color : null}
      />
    </>
  );
}
