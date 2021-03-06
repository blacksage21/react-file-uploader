import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import classNames from 'classnames';
import shortid from 'shortid';
import status from './constants/status';

class Receiver extends Component {
  constructor(props) {
    super(props);

    this.wrapper = window;
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onFileDrop = this.onFileDrop.bind(this);

    // this is to monitor the hierarchy
    // for window onDragEnter event
    this.state = {
      dragLevel: 0,
    };
  }

  componentDidMount() {
    invariant(
      (window.DragEvent || window.Event) && window.DataTransfer,
      'Browser does not support DnD events or File API.'
    );

    const { wrapperId } = this.props;

    if (wrapperId) {
      const wrapperElement = document.getElementById(wrapperId);

      invariant(
        !!wrapperElement,
        `wrapper element with Id ${wrapperId} not found.`
      );

      this.wrapper = wrapperElement;
    }

    this.wrapper.addEventListener('dragenter', this.onDragEnter);
    this.wrapper.addEventListener('dragleave', this.onDragLeave);
    this.wrapper.addEventListener('dragover', this.onDragOver);
    this.wrapper.addEventListener('drop', this.onFileDrop);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.wrapperId !== this.props.wrapperId) {
      // eslint-disable-next-line no-console
      console.warn('[Receiver.js] Change in props.wrapperId is unexpected, no new event listeners will be created.');
    }
  }

  componentWillUnmount() {
    this.wrapper.removeEventListener('dragenter', this.onDragEnter);
    this.wrapper.removeEventListener('dragleave', this.onDragLeave);
    this.wrapper.removeEventListener('dragover', this.onDragOver);
    this.wrapper.removeEventListener('drop', this.onFileDrop);
  }

  onDragEnter(e) {
    if (!e.dataTransfer.types.includes('Files')) {
      return;
    }

    const dragLevel = this.state.dragLevel + 1;

    this.setState({ dragLevel });

    if (!this.props.isOpen) {
      this.props.onDragEnter(e);
    }
  }

  onDragLeave(e) {
    const dragLevel = this.state.dragLevel - 1;

    this.setState({ dragLevel });

    if (dragLevel === 0) {
      this.props.onDragLeave(e);
    }
  }

  onDragOver(e) {
    e.preventDefault();
    this.props.onDragOver(e);
  }

  onFileDrop(e) {
    e.preventDefault();

    const uploads = [];

    if (e.dataTransfer && e.dataTransfer.files) {
      const fileList = e.dataTransfer.files;

      for (let i = 0; i < fileList.length; i++) {
        const upload = {
          id: shortid.generate(),
          status: status.PENDING,
          progress: 0,
          src: null,
          data: fileList[i]
        };

        uploads.push(upload);
      }
    }

    // reset drag level once dropped
    this.setState({ dragLevel: 0 });

    this.props.onFileDrop(e, uploads);
  }

  render() {
    const { isOpen, customClass, style, children } = this.props;

    return (
      isOpen ? (
        <div className={classNames(customClass)} style={style}>
          {children}
        </div>
      ) : null
    );
  }
}

Receiver.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  customClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  isOpen: PropTypes.bool.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func.isRequired,
  onFileDrop: PropTypes.func.isRequired,
  style: PropTypes.object,
  wrapperId: PropTypes.string,
};

Receiver.defaultProps = {
  isOpen: false
};

export default Receiver;
