const React = require('react');
const PropTypes = require('prop-types');
const { Button, Dropdown, Checkbox, ColorInput } = require('stremio/common');
const Icon = require('stremio-icons/dom');
const classnames = require('classnames');
const styles = require('./styles');

const SectionsList = React.forwardRef(({ className, sections, preferences, onPreferenceChanged, onScroll }, ref) => {
    const toggleCheckbox = (id) => {
        onPreferenceChanged(id, preferences[id] === 'true' ? 'false' : 'true');
    };

    const colorChanged = React.useCallback((event) => {
        const id = event.currentTarget.dataset.id;
        const color = event.nativeEvent.value;
        onPreferenceChanged(id, color);
    }, [onPreferenceChanged]);

    const updateDropdown = React.useCallback((event) => {
        const data = event.currentTarget.dataset;
        onPreferenceChanged(data.name, data.value);
    }, [onPreferenceChanged]);

    const updateStreamingDropdown = React.useCallback((event) => {
        const data = event.currentTarget.dataset;
        const newPrefs = { ...preferences.streaming, [data.name]: data.value };
        onPreferenceChanged('streaming', newPrefs);
    }, [onPreferenceChanged]);

    const checkUser = React.useCallback((event) => {
        if (!preferences.user) {
            // Here in Stremio 4 we show a toast with a message, asking the anonymous user to log in/register
            console.log('No user found');
            event.preventDefault();
        }
    }, []);

    // Determines whether the link should be opened in new window or in the current one.
    const getTargetFor = url => ['//', 'http://', 'https://', 'file://', 'ftp://', 'mailto:', 'magnet:']
        .some(scheme => url.startsWith(scheme)) ? '_blank' : '_self'

    // TODO: If we get the user data after initialization, these should be wrapped in React.useState and set by React.useEffect
    const changePasswordUrl = preferences.user && 'https://www.strem.io/reset-password/' + preferences.user.email;
    const webCalUrl = preferences.user && 'webcal://www.strem.io/calendar/' + preferences.user._id + '.ics';

    // TODO: move these out of here
    const cachingOptions = [{ "label": "no caching", "value": "0" }, { "label": "2GB", "value": "2147483648" }, { "label": "5GB", "value": "5368709120" }, { "label": "10GB", "value": "10737418240" }, { "label": "∞", "value": "Infinity" }];
    const supportedProfiles = ['default', 'soft', 'fast'];
    const mkProfiles = profiles => profiles.map(profile => ({
        label: profile[0].toUpperCase() + profile.slice(1).toLowerCase(),
        value: profile,
    }))
    const [streamingProfiles, setStreamingProfiles] = React.useState(mkProfiles(supportedProfiles));
    React.useEffect(() => {
        if (preferences.streaming.profile && !supportedProfiles.includes(preferences.streaming.profile)) {
            setStreamingProfiles(mkProfiles(supportedProfiles.concat(preferences.streaming.profile)));
        }
    }, [preferences.streaming.profile]);

    const sectionsElements = sections.map((section) =>
        <div key={section.id} ref={section.ref} className={styles['section']} data-section={section.id}>
            <div className={styles['section-header']}>{section.id}</div>
            {(section.inputs || [])
                .map((input) => {
                    if (input.type === 'user') {
                        return (
                            <React.Fragment key={'user'}>
                                <div className={classnames(styles['input-container'], styles['user-container'])}>
                                    {
                                        !preferences.user
                                            ?
                                            <div style={{ backgroundImage: `url('/images/anonymous.png')` }} className={styles['avatar']} />
                                            :
                                            <div style={{ backgroundImage: `url('${preferences.user.avatar}'), url('/images/default_avatar.png')` }} className={styles['avatar']} />
                                    }
                                    <div className={styles['email']}>{!preferences.user ? 'Anonymous user' : preferences.user.email}</div>
                                </div>
                                <div className={classnames(styles['input-container'], styles['button-container'])}>
                                    <Button className={styles['button']} href={'#/intro'}>
                                        <div className={styles['label']}>{preferences.user ? 'LOG OUT' : 'SIGN IN'}</div>
                                    </Button>
                                </div>
                                <div className={classnames(styles['input-container'], styles['link-container'])}>
                                    <Button className={styles['link']} href={changePasswordUrl} target={'_blank'} onClick={checkUser}>
                                        <div className={styles['label']}>{'Change password'}</div>
                                    </Button>
                                </div>
                                <div className={classnames(styles['input-container'], styles['text-container'])}>
                                    <div className={styles['text']}>
                                        <div className={styles['label']}>{'Import options'}</div>
                                    </div>
                                </div>
                                <div className={classnames(styles['input-container'], styles['link-container'])}>
                                    <Button className={styles['link']} href={'https://www.stremio.com/#TODO:install-facebook-addon'} target={'_blank'} onClick={checkUser}>
                                        <div className={styles['label']}>{'Import from Facebook'}</div>
                                    </Button>
                                </div>
                                <div className={classnames(styles['input-container'], styles['link-container'])}>
                                    <Button className={styles['link']} href={'https://www.stremio.com/#TODO:export-user-data'} target={'_blank'} onClick={checkUser}>
                                        <div className={styles['label']}>{'Export user data'}</div>
                                    </Button>
                                </div>
                                <div className={classnames(styles['input-container'], styles['link-container'])}>
                                    <Button className={styles['link']} href={webCalUrl} target={'_blank'} onClick={checkUser}>
                                        <div className={styles['label']}>{'Subscribe to calendar'}</div>
                                    </Button>
                                </div>
                                <div className={classnames(styles['input-container'], styles['link-container'])}>
                                    <Button className={styles['link']} href={'https://stremio.zendesk.com/'} target={'_blank'}>
                                        <div className={styles['label']}>{'Contact support'}</div>
                                    </Button>
                                </div>
                                <div className={classnames(styles['input-container'], styles['link-container'])}>
                                    <Button className={styles['link']} href={'https://docs.google.com/forms/d/e/1FAIpQLScubrlTpDMIPUUBlhZ5lwcXl3HxzKfunIMCX5Jnp-cDyglWjQ/viewform?usp=sf_link'} target={'_blank'}>
                                        <div className={styles['label']}>{'Request account deletion'}</div>
                                    </Button>
                                </div>
                                <div className={classnames(styles['input-container'], styles['button-container'])}>
                                    <div className={styles['input-header']}>{'Trakt Scrobbling'}</div>
                                    <Button className={styles['button']}>
                                        <Icon className={styles['icon']} icon={'ic_trackt'} />
                                        <div className={styles['label']}>{preferences.user && preferences.user.trakt ? 'ALREADY UTHENTIATED' : 'AUTHENTIATE'}</div>
                                    </Button>
                                </div>
                            </React.Fragment>
                        );
                    } else if (input.type === 'streaming') {
                        return (
                            <React.Fragment key={'streaming'}>

                                {
                                    // The streaming server settings are shown only if server is available
                                    preferences.streaming.isLoaded
                                        ?
                                        <React.Fragment>
                                            <div className={classnames(styles['input-container'], styles['select-container'])}>
                                                <div className={styles['input-header']}>Caching</div>
                                                <Dropdown options={cachingOptions} selected={[preferences.streaming.cacheSize]} name={'cacheSize'} className={styles['dropdown']} onSelect={updateStreamingDropdown} />
                                            </div>
                                            <div className={classnames(styles['input-container'], styles['select-container'])}>
                                                <div className={styles['input-header']}>Torrent Profile</div>
                                                <Dropdown options={streamingProfiles} selected={[preferences.streaming.profile]} name={'profile'} className={styles['dropdown']} onSelect={updateStreamingDropdown} />
                                            </div>
                                        </React.Fragment>
                                        :
                                        null
                                }
                                {/* From here there is only presentation */}
                                <div key={'server_url'} className={classnames(styles['input-container'], styles['text-container'])}>
                                    <div className={styles['input-header']}><strong>Streaming server URL:</strong> {preferences.server_url}</div>
                                </div>
                                <div key={'server_available'} className={classnames(styles['input-container'], styles['text-container'])}>
                                    <div className={styles['text']}>
                                        <Icon className={classnames(styles['icon'], { [styles['x-icon']]: !preferences.streaming.isLoaded })} icon={preferences.streaming.isLoaded ? 'ic_check' : 'ic_x'} />
                                        <div className={styles['label']}>{'Streaming server is ' + (preferences.streaming.isLoaded ? '' : 'not ') + 'available.'}</div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    } else if (input.type === 'select') {
                        return (
                            <div key={input.id} className={classnames(styles['input-container'], styles['select-container'])}>
                                {input.header ? <div className={styles['input-header']}>{input.header}</div> : null}
                                <Dropdown options={input.options} selected={[preferences[input.id]]} name={input.id} key={input.id} className={styles['dropdown']} onSelect={updateDropdown} />
                            </div>
                        );
                    } else if (input.type === 'link') {
                        return (
                            <div key={input.id} className={classnames(styles['input-container'], styles['link-container'])}>
                                {input.header ? <div className={styles['input-header']}>{input.header}</div> : null}
                                <Button ref={input.ref} className={styles['link']} href={input.href} target={getTargetFor(input.href)}>
                                    <div className={styles['label']}>{input.label}</div>
                                </Button>
                            </div>
                        );
                    } else if (input.type === 'button') {
                        return (
                            <div key={input.id} className={classnames(styles['input-container'], styles['button-container'])}>
                                {input.header ? <div className={styles['input-header']}>{input.header}</div> : null}
                                <Button ref={input.ref} className={styles['button']} href={input.href}>
                                    {input.icon ? <Icon className={styles['icon']} icon={input.icon} /> : null}
                                    <div className={styles['label']}>{input.label}</div>
                                </Button>
                            </div>
                        );
                    } else if (input.type === 'checkbox') {
                        return (
                            <div key={input.id} className={classnames(styles['input-container'], styles['checkbox-container'])}>
                                {input.header ? <div className={styles['input-header']}>{input.header}</div> : null}
                                <Checkbox ref={input.ref} className={styles['checkbox']} checked={preferences[input.id] === 'true'} onClick={toggleCheckbox.bind(null, input.id)}>
                                    <div className={styles['label']}>{input.label}</div>
                                </Checkbox>
                            </div>
                        );
                    } else if (input.type === 'static-text') {
                        return (
                            <div key={input.id} className={classnames(styles['input-container'], styles['text-container'])}>
                                {input.header ? <div className={styles['input-header']}>{input.header}</div> : null}
                                <div className={styles['text']}>
                                    {input.icon ? <Icon className={styles[input.icon === 'ic_x' ? 'x-icon' : 'icon']} icon={input.icon} /> : null}
                                    <div className={styles['label']}>{input.label}</div>
                                </div>
                            </div>
                        );
                    } else if (input.type === 'color') {
                        return (
                            <div key={input.id} className={classnames(styles['input-container'], styles['color-container'])}>
                                {input.header ? <div className={styles['input-header']}>{input.header}</div> : null}
                                <ColorInput className={styles['color-picker']} id={input.id} value={preferences[input.id]} onChange={colorChanged} />
                            </div>
                        );
                    } else if (input.type === 'info') {
                        return (
                            <div key={input.id} className={classnames(styles['input-container'])}>
                                <div className={styles['input-header']}><strong>{input.header}</strong> {preferences[input.id]}</div>
                            </div>
                        );
                    }
                })}
        </div>
    );

    return (
        <div ref={ref} className={className} onScroll={onScroll}>
            {sectionsElements}
        </div>
    );
});

SectionsList.propTypes = {
    className: PropTypes.string,
    sections: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        ref: PropTypes.shape({
            current: PropTypes.object,
        }).isRequired,
        inputs: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            id: PropTypes.string,
            header: PropTypes.string,
            label: PropTypes.string,
            icon: PropTypes.string,
            href: PropTypes.string,
            options: PropTypes.arrayOf(PropTypes.shape({
                label: PropTypes.string.isRequired,
                value: PropTypes.string.isRequired,
            })),
        })),
    })),
    preferences: PropTypes.object,
    onPreferenceChanged: PropTypes.func.isRequired,
    onScroll: PropTypes.func.isRequired,
};

module.exports = SectionsList;