import React from 'react';
// Import TinyMCE
import tinymce from 'tinymce/tinymce';

// Default icons are required for TinyMCE 5.3 or above
import 'tinymce/icons/default';

// A theme is also required
import 'tinymce/themes/silver';

// Any plugins you want to use has to be imported
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';

import './index.less';
import styles from './index.less';

export default class MyTinymce extends React.Component<any> {
  main: HTMLSpanElement | undefined | null = null;

  componentDidMount() {
    tinymce.init({
      selector: '#tiny',
      plugins: ['paste', 'link']
    });
  }

  render() {
    // const header = <div breadcrumb={['富文本实例']} title={'富文本实例'} />;

    return (
      <div className={styles['tinymce-components']}>
        <div>
          <div className="tinymce-container">
            <div>
              <textarea id="#tiny" className={styles['tinymce-textarea']} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
