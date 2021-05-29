import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { LocalStorage } from 'node-localstorage';
import { v4 as UUID } from 'uuid';

Enzyme.configure({ adapter: new Adapter() });
global.localStorage = window.localStorage = new LocalStorage(`/tmp/${UUID()}`);
