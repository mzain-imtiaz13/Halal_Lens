// pages/Shops.jsx
import React, { useEffect, useState } from "react";
import {
  listShops,
  createShop,
  updateShop,
  deleteShop,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductV2ById,
} from "../../api/services/shops";
import StatusBadge from "./StatusBadge";
import ShopForm from "./ShopForm";
import ProductForm from "./ProductForm";

import Modal from "../../components/Modal";
import Button from "../../components/Button";

export default function Shops() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // shop modals
  const [createShopOpen, setCreateShopOpen] = useState(false);
  const [editShop, setEditShop] = useState(null);
  const [savingShop, setSavingShop] = useState(false);

  // product modals
  const [addProductForShop, setAddProductForShop] = useState(null);
  const [editProductContext, setEditProductContext] = useState(null); // { shopId, product }
  const [savingProduct, setSavingProduct] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await listShops({});
      setRows(resp.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProductClick = async (shop, product) => {
    // If we don't have a productsV2Id on the mirror, just fall back to current data
    if (!product?.productsV2Id) {
      setEditProductContext({ shopId: shop.id, product });
      return;
    }

    setLoadingProduct(true);
    try {
      const resp = await getProductV2ById(product.productsV2Id);
      const full = resp?.data || {};

      // Merge full products_v2 data with the mirror so the form sees all fields
      const merged = {
        ...full,
        // keep id from shop mirror so ProductForm shows "Edit Product"
        id: product.id,
        name: full.productName || product.name,
        barcode: full.barcode || product.barcode,
        brands: full.brands || product.brand || product.brands,
        frontImageUrl: full.frontImageUrl || product.frontImage || product.picture,
        backImageUrl: full.backImageUrl || product.backImage,
        overallStatus: full.overallStatus || product.overallStatus || "",
        isVerified:
          typeof full.isVerified === "boolean"
            ? full.isVerified
            : !!product.verified,
      };

      setEditProductContext({ shopId: shop.id, product: merged });
    } finally {
      setLoadingProduct(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* --- Shop handlers --- */
  const handleCreateShop = async (data) => {
    setSavingShop(true);
    try {
      await createShop(data);
      setCreateShopOpen(false);
      await fetchData();
    } finally {
      setSavingShop(false);
    }
  };

  const handleUpdateShop = async (shopId, data) => {
    setSavingShop(true);
    try {
      await updateShop(shopId, data);
      setEditShop(null);
      await fetchData();
    } finally {
      setSavingShop(false);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm("Delete this shop?")) return;
    await deleteShop(shopId);
    await fetchData();
  };

  /* --- Product handlers --- */
  const handleAddProduct = async (shopId, payload) => {
    setSavingProduct(true);
    try {
      await addProduct(shopId, payload);
      setAddProductForShop(null);
      await fetchData();
    } finally {
      setSavingProduct(false);
    }
  };

  const handleUpdateProduct = async (shopId, productId, payload) => {
    setSavingProduct(true);
    try {
      await updateProduct(shopId, productId, payload);
      setEditProductContext(null);
      await fetchData();
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (shopId, productId) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(shopId, productId);
    await fetchData();
  };

  const ImgThumb = ({ src }) =>
    src ? (
      <img
        src={src}
        alt=""
        className="h-12 w-16 rounded-md border border-slate-200 object-cover"
      />
    ) : (
      <span className="text-xs text-slate-400">—</span>
    );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Shops &amp; Products
          </h2>
          <p className="text-sm text-slate-500">
            Manage your verified shops and the products they sell.
          </p>
        </div>
        <Button
          variant="primary"
          type="button"
          onClick={() => setCreateShopOpen(true)}
        >
          + Add Shop
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center text-sm text-slate-500">
          No shops yet. Click{" "}
          <span className="font-semibold text-slate-700">“Add Shop”</span> to
          create your first one.
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((shop) => (
            <div
              key={shop.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {/* Shop header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {shop.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {shop.address || "No address"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setEditShop(shop)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => setAddProductForShop(shop)}
                  >
                    Add Product
                  </Button>
                  <Button
                    variant="danger" outline
                    type="button"
                    onClick={() => handleDeleteShop(shop.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Products */}
              <div className="mt-3 flex-1">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Products
                </div>

                {shop.products?.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
                          <th className="border-b border-slate-200 px-2 py-2">
                            Picture
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Product
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Barcode
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Brands
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Status
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2">
                            Verified
                          </th>
                          <th className="border-b border-slate-200 px-2 py-2 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shop.products.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-slate-100 hover:bg-slate-50/70"
                          >
                            <td className="px-2 py-2 align-middle">
                              <ImgThumb src={p.frontImage || p.picture || ""} />
                            </td>
                            <td className="px-2 py-2 align-middle text-slate-800">
                              {p.name}
                            </td>
                            <td className="px-2 py-2 align-middle text-slate-700">
                              {p.barcode || "-"}
                            </td>
                            <td className="px-2 py-2 align-middle text-slate-700">
                              {p.brand || p.brands || "-"}
                            </td>
                            <td className="px-2 py-2 align-middle">
                              <StatusBadge value={p.overallStatus} />
                            </td>
                            <td className="px-2 py-2 align-middle">
                              <StatusBadge value={p.verified ? "Yes" : "No"} />
                            </td>
                            <td className="px-2 py-2 align-middle text-right">
                              <div className="inline-flex items-center gap-1">
                                <Button
                                  variant="secondary"
                                  type="button"
                                  onClick={() => handleEditProductClick(shop, p)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger" outline
                                  type="button"
                                  onClick={() =>
                                    handleDeleteProduct(shop.id, p.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-xs text-slate-500">
                    No products yet. Click{" "}
                    <span className="font-semibold text-slate-700">
                      “Add Product”
                    </span>{" "}
                    to create one.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === Modals === */}

      {/* Create shop */}
      <Modal isOpen={createShopOpen} onClose={() => setCreateShopOpen(false)}>
        <ShopForm
          onCancel={() => setCreateShopOpen(false)}
          onSave={handleCreateShop}
          saving={savingShop}
        />
      </Modal>

      {/* Edit shop */}
      <Modal isOpen={!!editShop} onClose={() => setEditShop(null)}>
        {editShop && (
          <ShopForm
            initial={editShop}
            onCancel={() => setEditShop(null)}
            onSave={(data) => handleUpdateShop(editShop.id, data)}
            saving={savingShop}
          />
        )}
      </Modal>

      {/* Add product */}
      <Modal
        isOpen={!!addProductForShop}
        onClose={() => setAddProductForShop(null)}
      >
        {addProductForShop && (
          <ProductForm
            onCancel={() => setAddProductForShop(null)}
            onSave={(data) => handleAddProduct(addProductForShop.id, data)}
            saving={savingProduct}
          />
        )}
      </Modal>

      {/* Edit product */}
      <Modal
        isOpen={!!editProductContext}
        onClose={() => setEditProductContext(null)}
      >
        {editProductContext && (
          <ProductForm
            initial={editProductContext.product}
            onCancel={() => setEditProductContext(null)}
            onSave={(data) =>
              handleUpdateProduct(
                editProductContext.shopId,
                editProductContext.product.id,
                data
              )
            }
            saving={savingProduct}
          />
        )}
      </Modal>
    </div>
  );
}