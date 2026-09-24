'use client';

import styles from '@/app/admin/products/products.module.css';

const emptyColor = () => ({ name: '', hex: '#5c3d2e' });

/**
 * Product-level color editor (solid or multicolor) + sibling product linker.
 */
export default function ProductColorEditor({
  colors = [],
  onChangeColors,
  siblingIds = [],
  onChangeSiblingIds,
  allProducts = [],
  currentProductId = null,
}) {
  const updateColor = (index, patch) => {
    onChangeColors(
      colors.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  };

  const removeColor = (index) => {
    onChangeColors(colors.filter((_, i) => i !== index));
  };

  const addColor = () => {
    onChangeColors([...(colors || []), emptyColor()]);
  };

  const toggleSibling = (id) => {
    const sid = String(id);
    onChangeSiblingIds(
      siblingIds.includes(sid)
        ? siblingIds.filter((x) => x !== sid)
        : [...siblingIds, sid]
    );
  };

  const linkable = (allProducts || []).filter(
    (p) => String(p.id) !== String(currentProductId || '')
  );

  return (
    <section className={styles.formSection}>
      <h2 className={styles.sectionTitle}>Color</h2>
      <p className={styles.formHint}>
        Add one color for a solid swatch, or multiple for a multicolor split. Link other
        products as color siblings so shoppers can switch on cards and PDP.
      </p>

      <div className={styles.colorEditorList}>
        {(colors || []).map((c, index) => (
          <div key={index} className={styles.colorEditorRow}>
            <input
              type="color"
              className={styles.colorCircle}
              value={c.hex || '#5c3d2e'}
              onChange={(e) => updateColor(index, { hex: e.target.value })}
              aria-label={`Color ${index + 1}`}
            />
            <input
              type="text"
              className={styles.formInput}
              placeholder="Color name (e.g. Brown)"
              value={c.name || ''}
              onChange={(e) => updateColor(index, { name: e.target.value })}
            />
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => removeColor(index)}
              aria-label="Remove color"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className={styles.colorEditorActions}>
        <button type="button" className={styles.secondaryBtn} onClick={addColor}>
          {colors?.length ? 'Add another color (multicolor)' : 'Add color'}
        </button>
      </div>

      {linkable.length > 0 && (
        <div className={styles.siblingBlock}>
          <label className={styles.formLabel}>Color siblings (other products)</label>
          <p className={styles.formHint}>
            Selecting a product links it so color radios navigate between PDPs.
          </p>
          <div className={styles.categoryChecklist}>
            {linkable.map((p) => {
              const id = String(p.id);
              const checked = siblingIds.includes(id);
              return (
                <label key={p.id} className={styles.categoryCheckItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSibling(id)}
                  />
                  <span>{p.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export { emptyColor };
